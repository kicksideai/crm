local component = require("component")
local hash = require("hash")
local normalize = require("normalize")
local storage = require("storage")
local types = require("types")
local sql = require("sql")
local writer = require("writer")

local M = {}

type UnknownMap = { [string]: unknown }
type DynamicTable = { [string | number]: unknown }
type Executor = sql.DB | sql.Transaction
type StringSet = { [string]: boolean }
type Score = {
    confidence: number,
    reason: string,
    evidence: unknown,
    evidence_hash: string,
}
type Route = { action: string }
type Decision = {
    decision: unknown?,
    evidence_hash: unknown?,
}
type Record = {
    record_id: unknown?,
    object_type: unknown?,
    values: unknown?,
}
type Page = {
    rows: unknown?,
    total: unknown?,
}
type Pending = {
    candidate_id: string,
    score: Score,
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function sorted_pair(first: unknown, second: unknown): (string, string)
    local left, right = tostring(first or ""), tostring(second or "")
    if left <= right then return left, right end
    return right, left
end

local function is_array(value: unknown): (boolean, number)
    if type(value) ~= "table" then return false, 0 end
    local count, maximum = 0, 0
    for key in pairs(value) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 then return false, 0 end
        count = count + 1
        if key > maximum then maximum = key end
    end
    return count == maximum, maximum
end

local function canonical(value: unknown): string
    local kind = type(value)
    if kind == "nil" then return "n" end
    if kind == "boolean" then return value and "b1" or "b0" end
    if kind == "number" then return "d" .. string.format("%.17g", tonumber(value) or 0) end
    if kind == "string" then return "s" .. tostring(#value) .. ":" .. value end
    if kind ~= "table" then return kind .. ":" .. tostring(value) end
    local source = value :: DynamicTable
    local array, length = is_array(value)
    if array then
        local parts = { "a" .. tostring(length) .. "[" }
        for index = 1, length do parts[#parts + 1] = canonical(source[index]) end
        parts[#parts + 1] = "]"
        return table.concat(parts, ";")
    end
    local keys = {}
    for key in pairs(source) do keys[#keys + 1] = key end
    table.sort(keys, function(left: string | number, right: string | number): boolean
        return canonical(left) < canonical(right)
    end)
    local parts = { "m{" }
    for _, key in ipairs(keys) do parts[#parts + 1] = canonical(key) .. "=" .. canonical(source[key]) end
    parts[#parts + 1] = "}"
    return table.concat(parts, ";")
end

function M.evidence_hash(evidence: unknown): string
    local digest, err = hash.sha256(canonical(type(evidence) == "table" and evidence or {}))
    if not digest then error("merge evidence hash failed: " .. tostring(err), 0) end
    return "v1:" .. tostring(digest)
end

local function rules_for(object_type: string, merge_config: unknown): UnknownMap?
    if type(merge_config) ~= "table" then return nil end
    local config = merge_config :: UnknownMap
    local objects = type(config.objects) == "table"
        and (config.objects :: { [string]: unknown }) or nil
    if not objects then return nil end
    local rules = objects[object_type]
    return type(rules) == "table" and (rules :: UnknownMap) or nil
end

local function normalized(pattern: UnknownMap, value: unknown): (string?, error?)
    if value == nil then return nil, nil end
    local normalizer = trim(pattern.normalizer)
    if normalizer == "" then return trim(tostring(value)), nil end
    return normalize.normalize(normalizer, value)
end

local function domain(value: unknown): (string?, error?)
    if value == nil then return nil, nil end
    return normalize.normalize("domain", value)
end

local function tokens(value: unknown): StringSet
    local result: StringSet = {}
    for token in trim(tostring(value or "")):lower():gmatch("[%w]+") do
        if #token > 1 then result[token] = true end
    end
    return result
end

local function name_similarity(left: unknown, right: unknown): number
    local left_tokens, right_tokens = tokens(left), tokens(right)
    local union, intersection = 0, 0
    for token in pairs(left_tokens) do
        union = union + 1
        if right_tokens[token] then intersection = intersection + 1 end
    end
    for token in pairs(right_tokens) do if not left_tokens[token] then union = union + 1 end end
    if union == 0 then return 0 end
    return intersection / union
end

local function match(pattern: UnknownMap, left: UnknownMap,
    right: UnknownMap): (boolean, UnknownMap?, error?)
    local kind = trim(pattern.kind)
    if kind == "value_exact" then
        local attr = trim(pattern.attr)
        if attr == "" then return false, nil, errors.new({ kind = errors.INVALID, message = "value_exact.attr is required" }) end
        local left_value, err = normalized(pattern, left[attr])
        if err then return false, nil, err end
        local right_value
        right_value, err = normalized(pattern, right[attr])
        if err then return false, nil, err end
        if left_value and left_value ~= "" and left_value == right_value then
            return true, { attr = attr, value = left_value }, nil
        end
        return false, nil, nil
    end
    if kind == "domain" then
        local attr = trim(pattern.attr)
        if attr == "" then return false, nil, errors.new({ kind = errors.INVALID, message = "domain.attr is required" }) end
        local left_domain, err = domain(left[attr])
        if err then return false, nil, err end
        local right_domain
        right_domain, err = domain(right[attr])
        if err then return false, nil, err end
        if left_domain and left_domain == right_domain then return true, { attr = attr, domain = left_domain }, nil end
        return false, nil, nil
    end
    if kind == "domain_name" then
        local domain_attr = trim(pattern.domain_attr)
        local name_attr = trim(pattern.name_attr)
        if domain_attr == "" or name_attr == "" then return false, nil, errors.new({ kind = errors.INVALID, message = "domain_name attrs are required" }) end
        local left_domain, err = domain(left[domain_attr])
        if err then return false, nil, err end
        local right_domain
        right_domain, err = domain(right[domain_attr])
        if err then return false, nil, err end
        if not left_domain or left_domain ~= right_domain then return false, nil, nil end
        local similarity = name_similarity(left[name_attr], right[name_attr])
        local minimum = tonumber(pattern.min_name_similarity)
        if not minimum then return false, nil, errors.new({ kind = errors.INVALID, message = "domain_name.min_name_similarity is required" }) end
        if minimum < 0 or minimum > 1 then return false, nil, errors.new({ kind = errors.INVALID, message = "domain_name.min_name_similarity must be between 0 and 1" }) end
        if similarity >= minimum then
            return true, {
                domain_attr = domain_attr,
                domain = left_domain,
                name_attr = name_attr,
                name_similarity = similarity,
            }, nil
        end
        return false, nil, nil
    end
    return false, nil, errors.new({ kind = errors.INVALID, message = "unsupported merge pattern: " .. kind })
end

function M.score_values(object_type: string, left: unknown, right: unknown,
    merge_config: unknown): (Score?, error?)
    local rules = rules_for(object_type, merge_config)
    local patterns = rules and type(rules.patterns) == "table"
        and (rules.patterns :: { unknown }) or {}
    local best: Score = {
        confidence = 0,
        reason = "no_match",
        evidence = {},
        evidence_hash = M.evidence_hash({}),
    }
    local left_values: UnknownMap = type(left) == "table" and (left :: UnknownMap) or {}
    local right_values: UnknownMap = type(right) == "table" and (right :: UnknownMap) or {}
    for _, value in ipairs(patterns) do
        if type(value) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "merge patterns must be objects" }) end
        local pattern = value :: UnknownMap
        local matched, evidence, err = match(pattern, left_values, right_values)
        if err then return nil, err end
        local weight = tonumber(pattern.weight)
        if not weight then return nil, errors.new({ kind = errors.INVALID, message = "merge pattern weight is required" }) end
        if weight < 0 or weight > 1 then return nil, errors.new({ kind = errors.INVALID, message = "merge pattern weight must be between 0 and 1" }) end
        local reason = trim(pattern.reason)
        if reason == "" then return nil, errors.new({ kind = errors.INVALID, message = "merge pattern reason is required" }) end
        if matched and weight > best.confidence then
            best = {
                confidence = weight,
                reason = reason,
                evidence = evidence or {},
                evidence_hash = M.evidence_hash(evidence or {}),
            }
        end
    end
    return best, nil
end

function M.route(object_type: string, confidence: number,
    merge_config: unknown): (Route?, error?)
    local rules = rules_for(object_type, merge_config)
    if not rules then return { action = "ignore" }, nil end
    local thresholds = type(rules.thresholds) == "table"
        and (rules.thresholds :: UnknownMap) or nil
    if not thresholds then return nil, errors.new({ kind = errors.INVALID, message = "merge thresholds are required for " .. object_type }) end
    local ignore_below = tonumber(thresholds.ignore_below)
    local review_at = tonumber(thresholds.review_at)
    if not ignore_below or not review_at then return nil, errors.new({ kind = errors.INVALID, message = "merge thresholds require ignore_below and review_at" }) end
    if ignore_below < 0 or ignore_below > 1 or review_at < 0 or review_at > 1 then
        return nil, errors.new({ kind = errors.INVALID, message = "merge thresholds must be between 0 and 1" })
    end
    if review_at < ignore_below then return nil, errors.new({ kind = errors.INVALID, message = "review_at must be greater than or equal to ignore_below" }) end
    local value = tonumber(confidence) or 0
    if value >= review_at and value >= ignore_below then return { action = "review" }, nil end
    return { action = "ignore" }, nil
end

local function decision(db: Executor, crm_id: string, left_id: string,
    right_id: string): (Decision?, error?)
    local left, right = sorted_pair(left_id, right_id)
    local rows, err = db:query([[
        SELECT decision, evidence_hash
        FROM kickside_crm_merge_decision
        WHERE crm_id = $1 AND left_id = $2 AND right_id = $3
        LIMIT 1
    ]], { crm_id, left, right })
    if err then return nil, err end
    if type(rows) ~= "table" or type(rows[1]) ~= "table" then return nil, nil end
    return rows[1] :: Decision, nil
end

local function should_emit(db: Executor, crm_id: string, left_id: string, right_id: string, evidence_hash: string): (boolean?, error?)
    local row, err = decision(db, crm_id, left_id, right_id)
    if err then return nil, err end
    if not row then return true, nil end
    local status = tostring(row.decision or "")
    if status == "merged" or status == "do_not_merge" then return false, nil end
    if (status == "pending" or status == "skipped")
        and tostring(row.evidence_hash or "") == evidence_hash then
        return false, nil
    end
    return true, nil
end

local function appended_seq(result: unknown): number?
    if type(result) ~= "table" then return nil end
    return tonumber((result :: UnknownMap).max_seq)
end

function M.suggest_for_record(crm_id: string, object_type: string,
    record_id: string): ({ UnknownMap }?, error?)
    if trim(crm_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    if trim(object_type) == "" then return nil, errors.new({ kind = errors.INVALID, message = "object_type is required" }) end
    if trim(record_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "record_id is required" }) end
    local _, access_err = component.validate_access(crm_id, component.ACCESS.WRITE)
    if access_err then return nil, errors.wrap(access_err, "crm access denied") end

    local db, err = sql.get(types.db_id())
    if err then return nil, err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
    local schema
    schema, err = storage.load_schema(db, crm_id)
    if err then db:release(); return nil, err end
    local schema_map = schema :: UnknownMap
    local declaration = type(schema_map.declaration) == "table"
        and (schema_map.declaration :: UnknownMap) or {}
    local merge_config = type(declaration.merge_config) == "table"
        and (declaration.merge_config :: UnknownMap) or {}
    local rules = rules_for(object_type, merge_config)
    if not rules or type(rules.patterns) ~= "table"
        or #(rules.patterns :: { unknown }) == 0 then
        db:release()
        return {}, nil
    end
    local current
    current, err = storage.get(db, crm_id, object_type, record_id)
    if err then db:release(); return nil, err end
    if not current then db:release(); return nil, errors.new({ kind = errors.NOT_FOUND, message = "CRM record not found" }) end

    local candidates: { Record }, offset = {}, 0
    repeat
        local page
        page, err = storage.list(db, crm_id, object_type, {
            limit = 500,
            offset = offset,
            sort = { attr = "record_id", dir = "asc" },
        })
        if not page then db:release(); return nil, err end
        local typed_page = page :: Page
        local rows = type(typed_page.rows) == "table" and (typed_page.rows :: { Record }) or {}
        for _, candidate in ipairs(rows) do
            if tostring(candidate.record_id or "") ~= record_id then
                candidates[#candidates + 1] = candidate
            end
        end
        offset = offset + #rows
        if offset >= (tonumber(typed_page.total) or 0) then break end
    until false

    local pending: { Pending } = {}
    local current_record = current :: Record
    for _, candidate in ipairs(candidates) do
        local score
        score, err = M.score_values(
            object_type, current_record.values or {}, candidate.values or {}, merge_config)
        if not score then db:release(); return nil, err end
        local route
        route, err = M.route(object_type, score.confidence, merge_config)
        if not route then db:release(); return nil, err end
        if route.action == "review" then
            local candidate_id = tostring(candidate.record_id or "")
            local emit
            emit, err = should_emit(db, crm_id, record_id, candidate_id, score.evidence_hash)
            if emit == nil then db:release(); return nil, err end
            if emit then pending[#pending + 1] = { candidate_id = candidate_id, score = score } end
        end
    end
    db:release()
    if #pending == 0 then return {}, nil end

    local commands: { UnknownMap }, output: { UnknownMap } = {}, {}
    for _, item in ipairs(pending) do
        local left, right = sorted_pair(record_id, item.candidate_id)
        local score = item.score
        local body: UnknownMap = {
            left_id = left,
            right_id = right,
            object_type = object_type,
            confidence = score.confidence,
            reason = score.reason,
            evidence = score.evidence,
            evidence_hash = score.evidence_hash,
        }
        commands[#commands + 1] = {
            type = types.EVENTS.MERGE_SUGGESTED,
            body = body,
            external = {
                external_source = "kickside.crm.merge_suggest",
                external_id = left .. ":" .. right .. ":" .. tostring(body.evidence_hash),
                external_version = "1",
            },
        }
        output[#output + 1] = {
            left_id = left, right_id = right, object_type = object_type,
            confidence = score.confidence, reason = score.reason,
            evidence = score.evidence, evidence_hash = score.evidence_hash,
            score = score,
        }
    end
    local ok, append_err, result = writer.append(crm_id, commands)
    if not ok then return nil, append_err end
    local target_seq = appended_seq(result)
    if target_seq then
        local _, checkpoint_err = writer.catch_up_read_model(crm_id, target_seq)
        if checkpoint_err then return nil, checkpoint_err end
    end
    for _, item in ipairs(output) do item.append = result end
    return output, nil
end

function M.after_resolve(crm_id: string, result: unknown): ({ UnknownMap }?, error?)
    local result_map: UnknownMap = type(result) == "table" and (result :: UnknownMap) or {}
    local record = type(result_map.record) == "table" and (result_map.record :: Record) or nil
    if not record then return {}, nil end
    return M.suggest_for_record(
        crm_id, tostring(record.object_type or ""), tostring(record.record_id or ""))
end

return M
