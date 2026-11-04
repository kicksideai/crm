-- kickside.crm.files download units (ATN-98): the attachment error code an
-- ingest failure maps to (contract §1), the edge that stands for a file and
-- how a failed upload read surfaces.
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

    test.describe("CRM record file unsupported types", function()
        test.it("refuses an archive by its content type whatever its name", function()
            test.is_true(download.unsupported_type("application/zip", "bundle.bin"))
            test.is_true(download.unsupported_type("Application/X-Zip-Compressed", nil))
        end)

        test.it("refuses an archive by its extension whatever its content type", function()
            test.is_true(download.unsupported_type("application/octet-stream", "Kestrel-Archive.ZIP"))
            test.is_true(download.unsupported_type(nil, "kestrel-archive.zip"))
        end)

        test.it("accepts readable files", function()
            test.is_false(download.unsupported_type("application/pdf", "brief.pdf"))
            test.is_false(download.unsupported_type("image/png", "order-flow.png"))
            test.is_false(download.unsupported_type("text/plain", "zip"))
            test.is_false(download.unsupported_type(nil, nil))
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

    -- record_files over stubbed reads: one ready edge whose upload this CRM wrote.
    test.describe("CRM record file reads", function()
        local saved = { reader = files.deps.reader, trusted = files.deps.trusted }
        local function with_reads(text: any, text_err: any, image_err: any): ({ any }?, any?)
            files.deps.reader = {
                internal_get_record = function() return nil, nil end,
                internal_references = function()
                    return { { edge_type = "attachment", active = true, to_ref = "file:u1",
                        attrs = { status = "ready", provider = "test", ref = "11" } } }, nil
                end,
            }
            files.deps.trusted = {
                provenance = function()
                    return { crm_files = { crm_id = "c1", record_id = "r1", provider = "test", ref = "11" } }
                end,
                primary_text = function() return text, text_err end,
                source_image = function() return nil, image_err end,
            }
            local out, err = files.record_files("c1", "crm:r1", {})
            files.deps.reader, files.deps.trusted = saved.reader, saved.trusted
            return out, err
        end

        test.it("reads an upload without a text artifact as a file with no text", function()
            local out, err = with_reads(nil, errors.new({ kind = errors.NOT_FOUND, message = "primary content artifact not found" }), nil)
            test.is_nil(err, tostring(err))
            test.eq(#(out :: { any }), 1)
            test.eq((out :: { any })[1].status, "ready")
            test.eq((out :: { any })[1].text_available, false)
        end)

        test.it("fails the read when the file text cannot be read", function()
            local out, err = with_reads(nil, "failed to get primary content artifact: database is locked", nil)
            test.is_nil(out)
            test.not_nil(err)
            test.eq(errors.is(err, errors.INTERNAL), true)
        end)

        test.it("fails the read when the file image cannot be read", function()
            local out, err = with_reads({ text = "x", chars = 1, truncated = false }, nil, "failed to find artifact parts: database is locked")
            test.is_nil(out)
            test.not_nil(err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
