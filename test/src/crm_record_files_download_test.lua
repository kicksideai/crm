-- kickside.crm.files:download units (ATN-98): the attachment error code an
-- ingest failure maps to (contract §1).
local test = require("test")
local download = require("download")

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
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
