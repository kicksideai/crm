local failures = {}
local snapshots = 0
local updates = 0
local applied = nil

return {
    reset = function(errors)
        failures, snapshots, updates, applied = errors, 0, 0, nil
    end,
    snapshots = function() return snapshots end,
    updates = function() return updates end,
    entry = function() return applied end,
    snapshot = function()
        snapshots = snapshots + 1
        local generation = snapshots
        local entry = nil
        return { changes = function()
            return {
                update = function(_, value)
                    updates = updates + 1
                    entry = value
                end,
                apply = function()
                    if failures[generation] then return nil, failures[generation] end
                    applied = entry
                    return true
                end,
            }
        end }
    end,
}
