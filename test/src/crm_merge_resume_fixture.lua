-- SPDX-License-Identifier: MIT
local M = { ACCESS = { WRITE = "write" } }
local active_actor = { id = function() return "reviewer" end }
local active_scope = {}
local calls: any = {}

function M.actor(): any return active_actor end
function M.scope(): any return active_scope end
function M.require_access(): boolean return true end
function M.get_record(): any return { object_type = "entity" } end
function M.append(): (boolean, nil, any) return true, nil, { max_seq = 1 } end
function M.catch_up_read_model(): any return { max_seq = 1 } end
function M.merge_resolution(_crm_id: string, resolution_id: string): any
    return { resolution_id = resolution_id, decision = "skipped", note = "Reviewed" }
end
function M.new(): any
    local executor: any = {}
    function executor:with_actor(actor: any): any self.actor = actor; return self end
    function executor:with_scope(scope: any): any self.scope = scope; return self end
    function executor:call(target: string, args: any): any
        calls[#calls + 1] = { target = target, args = args, actor = self.actor, scope = self.scope }
        return { ok = true }
    end
    return executor
end
function M.reset() calls = {} end
function M.recorded(): any return calls end
return M
