-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
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
    test.describe("CRM attachment boundaries", function()
        local original_files, original_download = files.deps, download.deps
        test.after_each(function() files.deps, download.deps = original_files, original_download end)

        test.it("links the same identity when completion precedes the delivery link", function()
            local writes = {}
            local token_args
            download.deps = {
                identity = {
                    capture = function() return {}, nil end,
                    to_row = function() return { actor_id = "actor", actor_context = {} }, nil end,
                },
                tokens = { pack = function(args) token_args = args; return "token", nil end },
                writer = { link_ref = function(crm_id, from_ref, edge_type, to_ref, attrs)
                    writes[#writes + 1] = { crm_id = crm_id, from_ref = from_ref, edge_type = edge_type, to_ref = to_ref, attrs = attrs }
                    return true, nil
                end },
                ingest = { ingest = function()
                    test.eq(token_args.on_error_id, download.ON_COMPLETE)
                    local result, err = download.on_upload_complete({ upload_id = token_args.upload_id,
                        status = "completed", params = token_args.params })
                    test.is_nil(err, tostring(err))
                    test.eq(result.success, true)
                    test.eq(#writes, 1, "callback links before ingest returns")
                    return { mime_type = "text/plain" }, nil
                end },
            }
            local result, err = download.fetch("crm", "record", { provider = "test", ref = "11", field = "file_url" }, "", 2)
            test.is_nil(err, tostring(err))
            test.eq(result, "downloaded")
            test.eq(#writes, 2)
            for _, write in ipairs(writes) do
                test.eq(write.crm_id, "crm")
                test.eq(write.from_ref, "crm:record")
                test.eq(write.edge_type, "attachment")
                test.eq(write.to_ref, "file:" .. token_args.upload_id)
                test.eq(write.attrs.provider, "test")
                test.eq(write.attrs.ref, "11")
                test.eq(write.attrs.attempt, 2)
                test.is_nil(write.attrs.status)
                test.is_nil(write.attrs.error)
            end
        end)

        test.it("preserves callback reference append errors", function()
            local fault = errors.new({ kind = errors.UNAVAILABLE, message = "reference storage unavailable" })
            download.deps = { writer = { link_ref = function() return nil, fault end } }
            local result, err = download.on_upload_complete({ upload_id = "upload", status = "error",
                params = { crm_id = "crm", record_id = "record", attrs = { provider = "test", ref = "11", attempt = 1 } } })
            test.is_nil(result)
            test.eq(err, fault)
        end)

        test.it("reads attachment references beyond the first page", function()
            files.deps = { reader = { internal_references = function(_, _, _, limit, offset)
                local rows = {}
                for i = offset + 1, math.min(offset + limit, 507) do
                    rows[#rows + 1] = { edge_type = "attachment", active = true, to_ref = "file:" .. tostring(i) }
                end
                return rows, nil
            end } }
            local rows, err = files.edges("crm", "record")
            test.is_nil(err, tostring(err))
            test.eq(#(rows or {}), 507)
        end)

        test.it("preserves upload status storage faults", function()
            local fault = errors.new({ kind = errors.UNAVAILABLE, message = "upload storage unavailable" })
            files.deps = { trusted = { info = function() return nil, fault end } }
            local state, err = files.state("crm", "record", edge("upload", "ready", ""))
            test.is_nil(state)
            test.eq(err, fault)
        end)

        test.it("reports the last pre-ingest error only while its upload is missing", function()
            local missing = errors.new({ kind = errors.NOT_FOUND, message = "Upload not found" })
            files.deps = { trusted = { info = function() return nil, missing end } }
            local held = edge("upload", "ready", "")
            held.attrs.error, held.attrs.error_detail = "no_access", "access denied"
            local state = assert(files.state("crm", "record", held))
            test.eq(state.status, "failed")
            test.eq(state.error, "no_access")
            held.attrs.error, held.attrs.error_detail = "not_found", "file removed"
            state = assert(files.state("crm", "record", held))
            test.eq(state.error, "not_found")
            test.eq(state.error_detail, "file removed")
        end)

        test.it("preserves provenance storage faults", function()
            local fault = errors.new({ kind = errors.UNAVAILABLE, message = "provenance storage unavailable" })
            files.deps = { trusted = { provenance = function() return nil, fault end } }
            local valid, err = files.authentic("crm", "record", "upload", {})
            test.eq(valid, false)
            test.eq(err, fault)
        end)

        test.it("rejects ambiguous attachment fetcher declarations", function()
            files.deps = { registry = { find = function()
                return {
                    { data = { provider = "test", fetch_func = "test:a", parse_func = "test:parse" } },
                    { data = { provider = "test", fetch_func = "test:b", parse_func = "test:parse" } },
                }, nil
            end } }
            local found, err = files.fetcher("test")
            test.is_nil(found)
            test.not_nil(err)
        end)

        test.it("authorizes a backfill before reading records or schema", function()
            local scanned = false
            local denied = errors.new({ kind = errors.PERMISSION_DENIED, message = "write required" })
            download.deps = {
                writer = { require_access = function() return nil, denied end },
                reader = { internal_objects = function() scanned = true; return {}, nil end },
            }
            local result, err = download.backfill("crm", "", {})
            test.is_nil(result)
            test.eq(err, denied)
            test.eq(scanned, false)
        end)

        test.it("authorizes a delivery before reading its record", function()
            local scanned = false
            local denied = errors.new({ kind = errors.PERMISSION_DENIED, message = "write required" })
            download.deps = {
                writer = { require_access = function() return nil, denied end },
                reader = { internal_get_record = function() scanned = true; return nil, nil end },
            }
            local result, err = download.download_record("crm", "record", "")
            test.eq(scanned, false)
            test.is_nil(result)
            test.eq(err, denied)
        end)

        test.it("preserves image artifact faults on the image surface", function()
            local fault = errors.new({ kind = errors.UNAVAILABLE, message = "image storage unavailable" })
            files.deps = {
                reader = {
                    internal_get_record = function() return nil, nil end,
                    internal_references = function() return {
                        { edge_type = "attachment", active = true, to_ref = "file:upload",
                            attrs = { provider = "test", ref = "ref", status = "ready" } },
                    }, nil end,
                },
                trusted = {
                    info = function() return { status = "completed" }, nil end,
                    provenance = function() return { crm_files = { crm_id = "crm", record_id = "record", provider = "test", ref = "ref" } }, nil end,
                    source_image = function() return nil, fault end,
                },
            }
            local result, err = files.record_file_image("crm", "record", "upload")
            test.is_nil(result)
            test.eq(err, fault)
        end)
    end)

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
        test.it("selects the newest attempt before its status", function()
            local old = edge("old", "ready", "2026-11-04T12:00:00Z")
            old.attrs.attempt = 1
            local newest = edge("new", "pending", "2026-11-04T09:00:00Z")
            newest.attrs.attempt = 2
            test.eq(files.best_edges({ old, newest })["test\0" .. "11"], newest)
            test.eq(files.best_edges({ newest, old })["test\0" .. "11"], newest)
        end)

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
                info = function() return { status = "completed" }, nil end,
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
