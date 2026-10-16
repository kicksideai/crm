local component = require("component")
local normalize = require("normalize")
local storage = require("storage")
local types = require("types")
local sql = require("sql")

local M = {}

type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction
type ReservationRow = { record_id: unknown?, state: unknown?, reserved_at: unknown? }
type AliasRow = { record_id: unknown? }
type Claim = {
    record_id: string,
    won: boolean,
    normalized: string?,
    alias_hash: string,
    state: string,
}
type FieldSchema = {
    data_type: unknown?,
    config: unknown?,
}
type ObjectSchema = {
    field_order: {string}?,
    fields: {[string]: FieldSchema}?,
}
type AliasDefinition = {
    attr: string,
    alias_type: string,
    data_type: unknown?,
}
type Command = { type: unknown?, body: unknown? }
type RecordBody = {
    object_type: unknown?,
    record_id: unknown?,
    values: unknown?,
    set: unknown?,
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function open_db(): (sql.DB?, error?)
    local db, err = sql.get(types.db_id())
    if err then return nil, err end
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
    return db, nil
end

local function require_access(crm_id: string, access: integer): (boolean?, error?)
    if trim(crm_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    local _, err = component.validate_access(crm_id, access)
    if err then return nil, errors.wrap(err, "crm access denied") end
    return true, nil
end

local function normalized_key(alias_type: string, value: unknown, crm_id: string, db: Executor): (string?, string?, error?)
    local normalized, err = normalize.normalize(alias_type, value)
    if not normalized then return nil, nil, err end
    local alias_hash
    alias_hash, err = normalize.hash(normalized, crm_id, db)
    if not alias_hash then return nil, nil, err end
    return normalized, alias_hash, nil
end

function M.normalized_key(alias_type: string, value: unknown, crm_id: string?, db: Executor?): (string?, string?, error?)
    local id = trim(crm_id)
    if id == "" then
        local normalized, err = normalize.normalize(alias_type, value)
        return normalized, nil, err
    end
    local executor, close, err
    if db then executor, close = db, false else executor, err = open_db(); close = true end
    if not executor then return nil, nil, err end
    local normalized, alias_hash, key_err = normalized_key(alias_type, value, id, executor)
    if close then executor:release() end
    return normalized, alias_hash, key_err
end

local function reservation(db: Executor, crm_id: string, object_scope: string, alias_type: string, alias_hash: string): (ReservationRow?, error?)
    local rows, err = db:query([[
        SELECT record_id, state, reserved_at
        FROM kickside_crm_alias_reservation
        WHERE crm_id = $1 AND object_scope = $2 AND alias_type = $3 AND alias_hash = $4
        LIMIT 1
    ]], { crm_id, object_scope, alias_type, alias_hash })
    if err then return nil, err end
    if type(rows) ~= "table" or type(rows[1]) ~= "table" then return nil, nil end
    return rows[1] :: ReservationRow, nil
end

local function alias(db: Executor, crm_id: string, object_scope: string, alias_type: string, alias_hash: string): (AliasRow?, error?)
    local rows, err = db:query([[
        SELECT record_id
        FROM kickside_crm_alias
        WHERE crm_id = $1 AND object_scope = $2 AND alias_type = $3 AND alias_hash = $4
        LIMIT 1
    ]], { crm_id, object_scope, alias_type, alias_hash })
    if err then return nil, err end
    if type(rows) ~= "table" or type(rows[1]) ~= "table" then return nil, nil end
    return rows[1] :: AliasRow, nil
end

function M.internal_lookup(db: Executor, crm_id: string, object_scope: string, alias_type: string, value: unknown): (string?, error?)
    local _, alias_hash, err = normalized_key(alias_type, value, crm_id, db)
    if not alias_hash then return nil, err end
    local row
    row, err = alias(db, crm_id, object_scope, alias_type, alias_hash)
    if err then return nil, err end
    return row and trim(row.record_id) or nil, nil
end

function M.lookup(crm_id: string, object_scope: string, alias_type: string, value: unknown): (string?, error?)
    local ok, err = require_access(crm_id, component.ACCESS.READ)
    if not ok then return nil, err end
    if trim(object_scope) == "" then return nil, errors.new({ kind = errors.INVALID, message = "object_scope is required" }) end
    local db
    db, err = open_db()
    if not db then return nil, err end
    local record_id
    record_id, err = M.internal_lookup(db, crm_id, object_scope, alias_type, value)
    db:release()
    return record_id, err
end

function M.internal_reserve(db: Executor, crm_id: string, object_scope: string, alias_type: string, value: unknown, proposed_record_id: string): (Claim?, error?)
    local normalized, alias_hash, err = normalized_key(alias_type, value, crm_id, db)
    if not alias_hash then return nil, err end
    local row
    row, err = reservation(db, crm_id, object_scope, alias_type, alias_hash)
    if err then return nil, err end
    if not row then
        local _, insert_err = db:execute([[
            INSERT INTO kickside_crm_alias_reservation
                (crm_id, object_scope, alias_type, alias_hash, record_id, state, reserved_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', $6)
            ON CONFLICT (crm_id, object_scope, alias_type, alias_hash) DO NOTHING
        ]], { crm_id, object_scope, alias_type, alias_hash, proposed_record_id, types.now() })
        if insert_err then return nil, insert_err end
        row, err = reservation(db, crm_id, object_scope, alias_type, alias_hash)
        if err then return nil, err end
    end
    if not row then return nil, errors.new({ kind = errors.INTERNAL, message = "alias reservation was not persisted" }) end

    -- A committed claim is stale once its record is gone: projection ran, the
    -- alias table does not assign the alias, and the locator no longer knows
    -- the record. The next claimant takes it over instead of being refused
    -- forever. A pending claim keeps blocking: its record is still landing.
    if trim(row.record_id) ~= proposed_record_id and tostring(row.state or "") == "committed" then
        local assigned
        assigned, err = alias(db, crm_id, object_scope, alias_type, alias_hash)
        if err then return nil, err end
        if not assigned then
            local live, live_err = db:query([[
                SELECT 1 AS present FROM kickside_crm_record_locator
                WHERE crm_id = $1 AND record_id = $2 LIMIT 1
            ]], { crm_id, trim(row.record_id) })
            if live_err then return nil, live_err end
            if type(live) ~= "table" or type(live[1]) ~= "table" then
                -- Placeholders are bound in order of appearance: the SET
                -- values come first, the key last.
                local _, take_err = db:execute([[
                    UPDATE kickside_crm_alias_reservation
                    SET record_id = $1, state = 'pending', reserved_at = $2
                    WHERE crm_id = $3 AND object_scope = $4 AND alias_type = $5 AND alias_hash = $6
                ]], { proposed_record_id, types.now(), crm_id, object_scope, alias_type, alias_hash })
                if take_err then return nil, take_err end
                row, err = reservation(db, crm_id, object_scope, alias_type, alias_hash)
                if err then return nil, err end
                if not row then return nil, errors.new({ kind = errors.INTERNAL, message = "alias reservation was not persisted" }) end
            end
        end
    end

    local owner = trim(row.record_id)
    return {
        record_id = owner,
        won = owner == proposed_record_id,
        normalized = normalized,
        alias_hash = alias_hash,
        state = tostring(row.state or ""),
    }, nil
end

function M.reserve(crm_id: string, object_scope: string, alias_type: string, value: unknown, proposed_record_id: string): (Claim?, error?)
    local ok, err = require_access(crm_id, component.ACCESS.WRITE)
    if not ok then return nil, err end
    if trim(object_scope) == "" then return nil, errors.new({ kind = errors.INVALID, message = "object_scope is required" }) end
    if trim(proposed_record_id) == "" then return nil, errors.new({ kind = errors.INVALID, message = "proposed_record_id is required" }) end
    local db
    db, err = open_db()
    if not db then return nil, err end
    local tx
    tx, err = db:begin()
    if err then db:release(); return nil, err end
    local result
    result, err = M.internal_reserve(tx, crm_id, object_scope, alias_type, value, proposed_record_id)
    if err then tx:rollback(); db:release(); return nil, err end
    local _, commit_err = tx:commit()
    if commit_err then tx:rollback(); db:release(); return nil, commit_err end
    db:release()
    return result, nil
end

local function alias_definitions(db: Executor, crm_id: string, object_type: string): ({AliasDefinition}?, error?)
    local loaded, err = storage.object(db, crm_id, object_type)
    if err then return nil, err end
    if type(loaded) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "CRM object schema is unavailable" }) end
    local object = loaded :: ObjectSchema
    local definitions: {AliasDefinition} = {}
    local fields = type(object.fields) == "table" and object.fields or {}
    for _, attr in ipairs(type(object.field_order) == "table" and object.field_order or {}) do
        local field = fields[attr]
        local config: UnknownMap = {}
        local data_type: unknown = nil
        if type(field) == "table" then
            data_type = field.data_type
            if type(field.config) == "table" then config = field.config :: UnknownMap end
        end
        local alias_type = trim(config.alias)
        if alias_type ~= "" then
            definitions[#definitions + 1] = { attr = attr, alias_type = alias_type, data_type = data_type }
        end
    end
    return definitions, nil
end

function M.alias_attrs(crm_id: string, object_type: string, alias_type: string): ({UnknownMap}?, error?)
    local ok, err = require_access(crm_id, component.ACCESS.READ)
    if not ok then return nil, err end
    local db
    db, err = open_db()
    if not db then return nil, err end
    local definitions
    definitions, err = alias_definitions(db, crm_id, object_type)
    db:release()
    if not definitions then return nil, err end
    local result: {UnknownMap} = {}
    for _, definition in ipairs(definitions) do
        if definition.alias_type == alias_type then
            result[#result + 1] = { attr = definition.attr, data_type = definition.data_type }
        end
    end
    return result, nil
end

local function is_empty(value: unknown): boolean
    return value == nil or type(value) == "string" and trim(value) == ""
end

function M.reserve_for_commands(crm_id: string, commands: unknown): ({Claim}?, error?)
    local ok, err = require_access(crm_id, component.ACCESS.WRITE)
    if not ok then return nil, err end
    local has_record_write = false
    local command_list: {unknown} = type(commands) == "table" and commands :: {unknown} or {}
    for _, raw_command in ipairs(command_list) do
        local command = type(raw_command) == "table" and raw_command :: Command or nil
        local event_type = command and command.type or nil
        if event_type == types.EVENTS.RECORD_CREATED or event_type == types.EVENTS.RECORD_UPDATED then
            has_record_write = true
            break
        end
    end
    if not has_record_write then return {}, nil end
    local db
    db, err = open_db()
    if not db then return nil, err end
    local tx
    tx, err = db:begin()
    if err then db:release(); return nil, err end
    local reserved: {Claim} = {}

    for _, raw_command in ipairs(command_list) do
        local command = type(raw_command) == "table" and raw_command :: Command or nil
        local event_type = command and command.type or nil
        if event_type == types.EVENTS.RECORD_CREATED or event_type == types.EVENTS.RECORD_UPDATED then
            local body: RecordBody = type(command.body) == "table" and command.body :: RecordBody or {}
            local object_type = trim(body.object_type)
            local record_id = trim(body.record_id)
            local values = event_type == types.EVENTS.RECORD_UPDATED and body.set or body.values
            local definitions
            definitions, err = alias_definitions(tx, crm_id, object_type)
            if not definitions then tx:rollback(); db:release(); return nil, err end
            for _, definition in ipairs(definitions) do
                local attr = definition.attr
                local value = type(values) == "table" and (values :: UnknownMap)[attr] or nil
                if not is_empty(value) then
                    local claim
                    claim, err = M.internal_reserve(tx, crm_id, object_type, definition.alias_type, value, record_id)
                    if not claim then tx:rollback(); db:release(); return nil, err end
                    if trim(claim.record_id) ~= record_id then
                        tx:rollback()
                        db:release()
                        return nil, errors.new({ kind = errors.CONFLICT, message = "alias conflict on " .. object_type .. "." .. tostring(attr) })
                    end
                    reserved[#reserved + 1] = claim
                end
            end
        end
    end

    local _, commit_err = tx:commit()
    if commit_err then tx:rollback(); db:release(); return nil, commit_err end
    db:release()
    return reserved, nil
end

local function retire(db: Executor, crm_id: string, object_type: string, alias_type: string, value: unknown, record_id: string): error?
    if is_empty(value) then return nil end
    local _, alias_hash, err = normalized_key(alias_type, value, crm_id, db)
    if not alias_hash then return err end
    local _, delete_err = db:execute([[
        DELETE FROM kickside_crm_alias
        WHERE crm_id = $1 AND object_scope = $2 AND alias_type = $3 AND alias_hash = $4 AND record_id = $5
    ]], { crm_id, object_type, alias_type, alias_hash, record_id })
    if delete_err then return delete_err end
    _, delete_err = db:execute([[
        DELETE FROM kickside_crm_alias_reservation
        WHERE crm_id = $1 AND object_scope = $2 AND alias_type = $3 AND alias_hash = $4 AND record_id = $5
    ]], { crm_id, object_type, alias_type, alias_hash, record_id })
    if delete_err then return delete_err end
    return nil
end

-- A claim this record cannot hold is withdrawn, so a refused write leaves no
-- reservation that would refuse every later claimant of the same alias.
local function withdraw(db: Executor, crm_id: string, object_type: string, alias_type: string, alias_hash: string, record_id: string): error?
    local _, delete_err = db:execute([[
        DELETE FROM kickside_crm_alias_reservation
        WHERE crm_id = $1 AND object_scope = $2 AND alias_type = $3 AND alias_hash = $4 AND record_id = $5
    ]], { crm_id, object_type, alias_type, alias_hash, record_id })
    if delete_err then return delete_err end
    return nil
end

local function commit(db: Executor, crm_id: string, object_type: string, alias_type: string, value: unknown, record_id: string, at: string): error?
    if is_empty(value) then return nil end
    local normalized, alias_hash, err = normalized_key(alias_type, value, crm_id, db)
    if not alias_hash then return err end
    local owner
    owner, err = alias(db, crm_id, object_type, alias_type, alias_hash)
    if err then return err end
    if owner and trim(owner.record_id) ~= record_id then
        err = withdraw(db, crm_id, object_type, alias_type, alias_hash, record_id)
        if err then return err end
        return errors.new({ kind = errors.CONFLICT, message = "alias belongs to another record" })
    end
    local row
    row, err = reservation(db, crm_id, object_type, alias_type, alias_hash)
    if err then return err end
    if row and trim(row.record_id) ~= record_id then return errors.new({ kind = errors.CONFLICT, message = "alias reservation belongs to another record" }) end
    if not row then
        local _, insert_err = db:execute([[
            INSERT INTO kickside_crm_alias_reservation
                (crm_id, object_scope, alias_type, alias_hash, record_id, state, reserved_at)
            VALUES ($1, $2, $3, $4, $5, 'committed', $6)
            ON CONFLICT (crm_id, object_scope, alias_type, alias_hash) DO NOTHING
        ]], { crm_id, object_type, alias_type, alias_hash, record_id, at })
        if insert_err then return insert_err end
    end
    local _, update_err = db:execute([[
        UPDATE kickside_crm_alias_reservation
        SET state = 'committed'
        WHERE crm_id = $1 AND object_scope = $2 AND alias_type = $3 AND alias_hash = $4 AND record_id = $5
    ]], { crm_id, object_type, alias_type, alias_hash, record_id })
    if update_err then return update_err end

    row, err = reservation(db, crm_id, object_type, alias_type, alias_hash)
    if err then return err end
    if not row or trim(row.record_id) ~= record_id then return errors.new({ kind = errors.CONFLICT, message = "alias reservation conflict" }) end
    local existing
    existing, err = alias(db, crm_id, object_type, alias_type, alias_hash)
    if err then return err end
    if existing and trim(existing.record_id) ~= record_id then return errors.new({ kind = errors.CONFLICT, message = "alias belongs to another record" }) end
    local _, insert_err = db:execute([[
        INSERT INTO kickside_crm_alias
            (crm_id, object_scope, alias_type, alias_hash, alias_display, record_id, source, is_primary, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'schema', $7, $8)
        ON CONFLICT (crm_id, object_scope, alias_type, alias_hash) DO UPDATE SET
            alias_display = excluded.alias_display,
            source = excluded.source,
            is_primary = excluded.is_primary,
            updated_at = excluded.updated_at
        WHERE kickside_crm_alias.record_id = excluded.record_id
    ]], { crm_id, object_type, alias_type, alias_hash, normalize.display(alias_type, normalized), record_id, true, at })
    if insert_err then return insert_err end
    existing, err = alias(db, crm_id, object_type, alias_type, alias_hash)
    if err then return err end
    if not existing or trim(existing.record_id) ~= record_id then return errors.new({ kind = errors.CONFLICT, message = "alias ownership conflict" }) end
    return nil
end

function M.project(db: Executor, crm_id: string, object_type: string, record_id: string, before: unknown, after: unknown, at: string): error?
    local definitions, err = alias_definitions(db, crm_id, object_type)
    if not definitions then return err end
    local before_values: UnknownMap = type(before) == "table" and before :: UnknownMap or {}
    local after_values: UnknownMap = type(after) == "table" and after :: UnknownMap or {}
    for _, definition in ipairs(definitions) do
        local attr = definition.attr
        local alias_type = definition.alias_type
        local old_value, new_value = before_values[attr], after_values[attr]
        if old_value ~= new_value then
            err = retire(db, crm_id, object_type, alias_type, old_value, record_id)
            if err then return err end
        end
        if not is_empty(new_value) then
            err = commit(db, crm_id, object_type, alias_type, new_value, record_id, at)
            if err then return err end
        end
    end
    return nil
end

return M
