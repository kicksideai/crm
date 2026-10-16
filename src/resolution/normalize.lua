local base64 = require("base64")
local crypto = require("crypto")
local env = require("env")
local sql = require("sql")
local types = require("types")

local M = {}
type UnknownMap = { [string]: unknown }
type Executor = sql.DB | sql.Transaction

local SECRET_VERSION = "v1"

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function hex_to_bytes(hex: string): (string?, error?)
    if #hex ~= 64 then return nil, errors.new({ kind = errors.INTERNAL, message = "ENCRYPTION_KEY must be 64 hex characters" }) end
    local bytes = {}
    for index = 1, #hex, 2 do
        local byte = tonumber(hex:sub(index, index + 1), 16)
        if not byte then return nil, errors.new({ kind = errors.INTERNAL, message = "ENCRYPTION_KEY contains non-hex characters" }) end
        bytes[#bytes + 1] = string.char(byte :: integer)
    end
    return table.concat(bytes), nil
end

local function encryption_key(): (string?, error?)
    local value, err = env.get("ENCRYPTION_KEY")
    if err then return nil, errors.wrap(err, "failed to read ENCRYPTION_KEY") end
    if type(value) ~= "string" or value == "" then return nil, errors.new({ kind = errors.INTERNAL, message = "ENCRYPTION_KEY is required" }) end
    return hex_to_bytes(value)
end

local function encrypt(secret: string): (string?, error?)
    local key, err = encryption_key()
    if not key then return nil, err end
    local encrypted
    encrypted, err = crypto.encrypt.aes(secret, key)
    if err then return nil, errors.wrap(err, "alias secret encryption failed") end
    return base64.encode(encrypted), nil
end

local function decrypt(value: unknown): (string?, error?)
    if type(value) ~= "string" or value == "" then return nil, errors.new({ kind = errors.INTERNAL, message = "alias secret is empty" }) end
    local key, err = encryption_key()
    if not key then return nil, err end
    local encrypted
    encrypted, err = base64.decode(value)
    if err then return nil, errors.wrap(err, "alias secret is not valid base64") end
    local secret
    secret, err = crypto.decrypt.aes(encrypted, key)
    if err then return nil, errors.wrap(err, "alias secret decryption failed") end
    return secret, nil
end

local function open_db(db: Executor?): (Executor?, boolean, error?)
    if db then return db, false, nil end
    local opened, err = sql.get(types.db_id())
    if err then return nil, false, err end
    if not opened then return nil, false, errors.new({ kind = errors.UNAVAILABLE, message = "CRM database unavailable" }) end
    return opened, true, nil
end

local function read_secret(db: Executor, crm_id: string): (string?, error?)
    local rows, err = db:query([[
        SELECT secret_encrypted
        FROM kickside_crm_alias_secret
        WHERE crm_id = $1 AND key_version = $2
        LIMIT 1
    ]], { crm_id, SECRET_VERSION })
    if err then return nil, err end
    local row = type(rows) == "table" and rows[1] or nil
    if not row then return nil, nil end
    return decrypt((row :: UnknownMap).secret_encrypted)
end

function M.ensure_secret(crm_id: string, db: Executor?): (string?, error?)
    local id = trim(crm_id)
    if id == "" then return nil, errors.new({ kind = errors.INVALID, message = "crm_id is required" }) end
    local executor, close, err = open_db(db)
    if not executor then return nil, err end

    local secret
    secret, err = read_secret(executor, id)
    if err then
        if close then executor:release() end
        return nil, err
    end
    if secret then
        if close then executor:release() end
        return secret, nil
    end

    secret, err = crypto.random.bytes(32)
    if err then
        if close then executor:release() end
        return nil, errors.wrap(err, "alias secret generation failed")
    end
    local encrypted
    encrypted, err = encrypt(secret :: string)
    if not encrypted then
        if close then executor:release() end
        return nil, err
    end
    local _, insert_err = executor:execute([[
        INSERT INTO kickside_crm_alias_secret
            (crm_id, key_version, secret_encrypted, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $4)
        ON CONFLICT (crm_id, key_version) DO NOTHING
    ]], { id, SECRET_VERSION, encrypted, types.now() })
    if insert_err then
        if close then executor:release() end
        return nil, insert_err
    end

    secret, err = read_secret(executor, id)
    if close then executor:release() end
    if err then return nil, err end
    if not secret then return nil, errors.new({ kind = errors.INTERNAL, message = "alias secret was not persisted" }) end
    return secret, nil
end

local function domain(value: string): string
    local result = trim(value):lower()
    result = result:gsub("^%a[%w+.-]*://", "")
    result = result:gsub("^//", "")
    result = result:gsub("^.-@", "")
    result = result:gsub("[/?#].*$", "")
    result = result:gsub(":%d+$", "")
    result = result:gsub("%.$", "")
    result = result:gsub("^www%.", "")
    return result
end

local function phone(value: string): string
    local raw = trim(value)
    local international = raw:sub(1, 1) == "+"
    local digits = raw:gsub("%D", "")
    if digits == "" then return "" end
    return international and "+" .. digits or digits
end

function M.normalize(alias_type: unknown, value: unknown): (string?, error?)
    local kind = trim(alias_type)
    if kind == "" then return nil, errors.new({ kind = errors.INVALID, message = "alias_type is required" }) end
    if type(value) ~= "string" and type(value) ~= "number" then return nil, errors.new({ kind = errors.INVALID, message = "alias_value is required" }) end
    local raw = trim(tostring(value))
    if raw == "" then return nil, errors.new({ kind = errors.INVALID, message = "alias_value is required" }) end

    if kind == "email" then
        local result = raw:lower()
        if not result:match("^[^@%s]+@[^@%s]+%.[^@%s]+$") then return nil, errors.new({ kind = errors.INVALID, message = "invalid email alias" }) end
        return result, nil
    end
    if kind == "domain" then
        local result = domain(raw)
        if not result:match("^[%w.-]+%.[%w-]+$") then return nil, errors.new({ kind = errors.INVALID, message = "invalid domain alias" }) end
        return result, nil
    end
    if kind == "phone" then
        local result = phone(raw)
        if result == "" then return nil, errors.new({ kind = errors.INVALID, message = "invalid phone alias" }) end
        return result, nil
    end
    if kind == "linkedin" then return raw:lower():gsub("/+$", ""), nil end
    if kind:match("^external:[a-z][a-z0-9_.-]*$") then return raw, nil end
    return nil, errors.new({ kind = errors.INVALID, message = "unsupported alias_type: " .. kind })
end

function M.hash(normalized: string, crm_id: string, db: Executor?): (string?, error?)
    if type(normalized) ~= "string" or normalized == "" then return nil, errors.new({ kind = errors.INVALID, message = "normalized alias is required" }) end
    local secret, err = M.ensure_secret(crm_id, db)
    if not secret then return nil, err end
    local digest
    digest, err = crypto.hmac.sha256(secret, normalized)
    if err then return nil, errors.wrap(err, "alias hash failed") end
    return base64.encode(digest), nil
end

function M.policy(): UnknownMap
    return {
        email = { trim = true, lowercase_ascii = true, plus_address_folding = false },
        domain = {
            trim = true,
            lowercase_ascii = true,
            strip_scheme = true,
            strip_www = true,
            strip_path_query_fragment = true,
            strip_trailing_dot = true,
            idna = false,
            registrable_domain = false,
        },
    }
end

function M.display(alias_type: unknown, normalized: unknown): string?
    local kind = trim(alias_type)
    if kind == "email" or kind == "phone" then return nil end
    if type(normalized) ~= "string" or normalized == "" then return nil end
    return normalized
end

return M
