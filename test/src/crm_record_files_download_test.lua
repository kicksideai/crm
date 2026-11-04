-- kickside.crm.files download units (ATN-98): the attachment error code an
-- ingest failure maps to (contract §1) and the edge that stands for a file.
local test = require("test")
local download = require("download")
local files = require("files")

local function edge(upload_id: string, status: string, updated_at: string): { [string]: any }
    return { to_ref = "file:" .. upload_id, attrs = { provider = "test", ref = "11", status = status, updated_at = updated_at } }
end

local function define_tests()
    test.describe("CRM record file download error codes", function()
        test.it("keeps a provider code from the contract vocabulary", function()
            local code, detail = download.error_code("fetch failed: no_access: file metadata HTTP 403")
            test.eq(code, "no_access")
            test.eq(detail, "file metadata HTTP 403")
            test.eq((download.error_code("fetch failed: not_found: file metadata HTTP 404")), "not_found")
            test.eq((download.error_code("fetch failed: too_large: declared 61 MB")), "too_large")
        end)

        test.it("reads a word outside the vocabulary as download_failed", function()
            local code, detail = download.error_code("fetch failed: timeout: deadline exceeded")
            test.eq(code, "download_failed")
            test.eq(detail, "fetch failed: timeout: deadline exceeded")
            test.eq((download.error_code("fetch failed: conversion_failed: x")), "download_failed")
            test.eq((download.error_code("fetch failed: expired: x")), "download_failed")
        end)

        test.it("maps ingest messages without a provider code", function()
            test.eq((download.error_code("too large")), "too_large")
            test.eq((download.error_code("download failed: connection reset")), "download_failed")
            test.eq((download.error_code("upload failed: disk full")), "upload_failed")
            test.eq((download.error_code("fetch failed: no code here")), "download_failed")
        end)
    end)

    test.describe("CRM record file edge choice", function()
        test.it("lets the edge furthest along stand for a file, in either order", function()
            local failed = edge("a", "failed", "2026-11-04T12:00:00Z")
            local pending = edge("b", "pending", "2026-11-04T10:00:00Z")
            local ready = edge("c", "ready", "2026-11-04T09:00:00Z")
            test.eq(files.best_edges({ failed, pending })["test\0" .. "11"], pending)
            test.eq(files.best_edges({ pending, failed })["test\0" .. "11"], pending)
            test.eq(files.best_edges({ pending, ready, failed })["test\0" .. "11"], ready)
            test.eq(files.best_edges({ failed, ready, pending })["test\0" .. "11"], ready)
        end)

        test.it("lets the later edge stand on a tie", function()
            local early = edge("a", "pending", "2026-11-04T09:00:00Z")
            local late = edge("b", "pending", "2026-11-04T11:00:00Z")
            test.eq(files.best_edges({ early, late })["test\0" .. "11"], late)
            test.eq(files.best_edges({ late, early })["test\0" .. "11"], late)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
