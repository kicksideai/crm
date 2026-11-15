-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local env = require("env")
local M = {reads = 0}
function M.get(variable)
    M.reads = M.reads + 1
    return env.get(variable)
end
return M
