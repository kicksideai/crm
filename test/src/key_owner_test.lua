-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local sql=require("sql")
local uuid=require("uuid")
local funcs=require("funcs")
local security=require("security")
local env=require("env")
local crypto=require("crypto")
local base64=require("base64")
local consts=require("consts")

local function execute(statement,args)
    local db=assert(sql.get("app:db"))
    local result,err=db:execute(statement,args)
    db:release()
    test.is_nil(err,tostring(err))
    return result
end

local function probe(args)
    local before,before_err=env.get("ENCRYPTION_KEY")
    local result,err=funcs.call("kickside.crm.read:alias_lookup",{crm_id=args.id,object_type="entity",alias_type="email",value="key-owner@example.test"})
    local after,after_err=env.get("ENCRYPTION_KEY")
    return {result=result,error=err and tostring(err),before_denied=before==nil and before_err~=nil,after_denied=after==nil and after_err~=nil}
end

local function define()
    test.describe("CRM key ownership",function()
        local id=uuid.v7()
        local actor="key-owner-member"
        local previous_key
        local function call()
            local scope=security.new_scope({assert(security.policy("app:key_owner_caller"))})
            local value,err=funcs.new():with_actor(security.new_actor(actor,{})):with_scope(scope):call("app:key_owner_probe",{id=id})
            test.is_nil(err,tostring(err));test.not_nil(value)
            test.is_true(value.before_denied);test.is_true(value.after_denied)
            test.is_nil(value.error,tostring(value.error));test.not_nil(value.result)
            return value.result
        end
        test.before_all(function()
            previous_key=env.get("ENCRYPTION_KEY")
            local _,key_err=env.set("ENCRYPTION_KEY",string.rep("ab",32))
            test.is_nil(key_err,tostring(key_err))
            execute([[INSERT INTO kickside_components(component_id,impl_id,private_context,created_at,updated_at) VALUES($1,$2,'{}',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],{id,consts.CRM_IMPL})
            execute([[INSERT INTO kickside_component_access(access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at) VALUES($1,$2,'user',$3,$4,1,CURRENT_TIMESTAMP)]],{uuid.v7(),actor,id,id})
        end)
        test.after_all(function()
            local _,key_err=env.set("ENCRYPTION_KEY",previous_key)
            test.is_nil(key_err,tostring(key_err))
            for _,name in ipairs({"kickside_crm_alias","kickside_crm_alias_secret","kickside_component_access","kickside_components"}) do
                local column=name=="kickside_crm_alias" or name=="kickside_crm_alias_secret"
                execute("DELETE FROM "..name.." WHERE "..(column and "crm_id" or "component_id").."=$1",{id})
            end
        end)
        test.it("decrypts a previous ciphertext in the owning read function",function()
            execute([[INSERT INTO kickside_crm_alias_secret(crm_id,key_version,secret_encrypted,created_at,updated_at) VALUES($1,'v1',$2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]],{id,"AAECAwQFBgcICQoLUyh1LT1kFis3XCr6Culd0daQBjitBgrg2Ta47RK0ftfZPjfFJBD+ziRQrUlYHUiI"})
            execute([[INSERT INTO kickside_crm_alias(crm_id,object_scope,alias_type,alias_hash,record_id,updated_at) VALUES($1,'entity','email',$2,'fixture-record',CURRENT_TIMESTAMP)]],{id,"MWUwZWYyZjZjZTBmMGQ4OGFhYzEyNDUyNmE1YTU4M2NkYjRjNDAyOGYwMTQxOTZjMTg5YzA5MTQyZDUyYTVhMQ=="})
            test.eq(call().record_id,"fixture-record")
        end)
        test.it("creates and reopens its encrypted alias secret without a caller key grant",function()
            execute("DELETE FROM kickside_crm_alias_secret WHERE crm_id=$1",{id})
            test.eq(call().record_id,"")
            test.eq(call().record_id,"")
            local db=assert(sql.get("app:db"))
            local rows,err=db:query("SELECT secret_encrypted FROM kickside_crm_alias_secret WHERE crm_id=$1",{id})
            db:release();test.is_nil(err,tostring(err));test.eq(#rows,1)
            local decoded,decode_err=base64.decode(rows[1].secret_encrypted)
            test.is_nil(decode_err)
            local plain,decrypt_err=crypto.decrypt.aes(decoded,string.rep(string.char(171),32))
            test.is_nil(decrypt_err);test.eq(#plain,32)
        end)
    end)
end
return {run=test.run_cases(define),probe=probe}
