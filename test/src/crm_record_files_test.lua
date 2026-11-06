-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- record_files / record_file_image (ATN-98) on stubbed read model, registry,
-- provider parse function and trusted reader.
local test = require("test")
local files = require("files")

local CRM = "crm-1"
local RECORD = "person:hubspot:1"

local function edge(upload_id: string, attrs: any, over: any): any
    local row = { from_ref = "crm:" .. RECORD, edge_type = "attachment", to_ref = "file:" .. upload_id,
        active = true, attrs = attrs }
    for k, v in pairs(over or {}) do row[k] = v end
    return row
end

local function origin(ref: string): any
    return { crm_id = CRM, record_id = RECORD, provider = "hubspot", ref = ref }
end

-- world: value of file_url, edges, provenance by upload, texts, images.
local function stub(world: any)
    local calls = { parse = 0 }
    files.deps = {
        reader = {
            internal_attributes = function(_crm, _type)
                return {
                    { object_type = "person", attr = "email", config = {} },
                    { object_type = "person", attr = "file_url", config = { attachment = { provider = "hubspot" } } },
                    { object_type = "person", attr = "file_upload", config = { attachment = { provider = "hubspot" } } },
                }, nil
            end,
            internal_get_record = function(_crm, id)
                if world.no_record then return nil, nil end
                return { record_id = id, object_type = "person",
                    values = { file_url = world.file_url, file_upload = world.file_upload } }, nil
            end,
            internal_references = function(_crm, from_ref, _inactive, _limit, _offset)
                test.eq(from_ref, "crm:" .. RECORD)
                return world.edges or {}, nil
            end,
        },
        registry = { find = function()
            return { { data = { provider = "hubspot", fetch_func = "p:fetch", parse_func = "p:parse" } } }, nil
        end },
        funcs = { call = function(id, args)
            test.eq(id, "p:parse")
            calls.parse = calls.parse + 1
            local refs = {}
            for ref in tostring(args.value):gmatch("[^;]+") do refs[#refs + 1] = { ref = ref } end
            return { refs = refs }, nil
        end },
        trusted = {
            info = function(upload_id)
                if not (world.origins or {})[upload_id] then
                    return nil, errors.new({ kind = errors.NOT_FOUND, message = "Upload not found" })
                end
                return { status = "completed" }, nil
            end,
            provenance = function(upload_id)
                local o = (world.origins or {})[upload_id]
                if not o then return nil, errors.new({ kind = errors.NOT_FOUND, message = "Upload not found" }) end
                return { source = "hubspot", crm_files = o }, nil
            end,
            primary_text = function(upload_id, max_chars)
                local text = (world.texts or {})[upload_id]
                -- As uploads answers an upload without a primary text artifact.
                if not text then return nil, errors.new({ kind = errors.NOT_FOUND, message = "primary content artifact not found" }) end
                return { text = text:sub(1, max_chars), chars = #text, truncated = #text > max_chars,
                    metadata = { pages = 2 } }, nil
            end,
            source_image = function(upload_id)
                return (world.images or {})[upload_id], nil
            end,
            image_bytes = function(upload_id, artifact_id, max_bytes)
                test.eq(max_bytes, files.MAX_IMAGE_BYTES)
                return { bytes = "PNG:" .. upload_id .. ":" .. artifact_id, content_type = "image/png", size = 9 }, nil
            end,
        },
    }
    return calls
end

local function define_tests()
    test.describe("record_files", function()
        local original = files.deps
        test.after_each(function() files.deps = original end)

        test.it("lists expected files as pending before any edge exists", function()
            stub({ file_url = "11;22", file_upload = "22;33" })
            local out = files.record_files(CRM, "crm:" .. RECORD)
            test.eq(#out, 3)
            test.eq(out[1].ref, "11"); test.eq(out[1].field, "file_url"); test.eq(out[1].status, "pending")
            test.is_nil(out[1].upload_id)
            test.eq(out[2].ref, "22"); test.eq(out[2].field, "file_url")
            test.eq(out[3].ref, "33"); test.eq(out[3].field, "file_upload")
        end)

        test.it("returns text and the source image of ready files that pass the provenance check", function()
            stub({
                file_url = "11;22",
                edges = {
                    edge("u-pdf", { status = "ready", provider = "hubspot", ref = "11", filename = "a.pdf" }),
                    edge("u-png", { status = "ready", provider = "hubspot", ref = "22", filename = "b.png" }),
                },
                origins = { ["u-pdf"] = origin("11"), ["u-png"] = origin("22") },
                texts = { ["u-pdf"] = "# Brief", ["u-png"] = "OCR text" },
                images = { ["u-png"] = { artifact_id = "a1", content_type = "image/png", size = 9 } },
            })
            local out = files.record_files(CRM, RECORD, { max_chars = 3 })
            test.eq(out[1].upload_id, "u-pdf")
            test.eq(out[1].status, "ready")
            test.eq(out[1].text, "# B")
            test.eq(out[1].text_truncated, true)
            test.eq(out[1].text_chars, 7)
            test.eq(out[1].pages, 2)
            test.is_nil(out[1].image)
            test.eq(out[2].image.artifact_id, "a1")
        end)

        test.it("refuses an edge whose upload was not written for this record", function()
            stub({
                file_url = "11",
                edges = { edge("u-foreign", { status = "ready", provider = "hubspot", ref = "11" }) },
                origins = { ["u-foreign"] = { crm_id = CRM, record_id = "person:other", provider = "hubspot", ref = "11" } },
                texts = { ["u-foreign"] = "secret" },
            })
            local out = files.record_files(CRM, RECORD)
            test.eq(out[1].status, "failed")
            test.eq(out[1].error, "no_access")
            test.is_nil(out[1].text)
        end)

        test.it("passes failed and pending edges through and lists edges linked otherwise last", function()
            stub({
                file_url = "11;22",
                edges = {
                    edge("u-old", { status = "ready", provider = "box", ref = "99" }),
                    edge("u-gone", { status = "ready", provider = "hubspot", ref = "77" }),
                    edge("u-1", { status = "failed", provider = "hubspot", ref = "11", error = "too_large" }),
                    edge("u-2", { status = "pending", provider = "hubspot", ref = "22" }),
                    edge("u-off", { status = "ready", provider = "hubspot", ref = "11" }, { active = false }),
                    edge("x", { status = "ready" }, { edge_type = "document" }),
                },
                origins = { ["u-old"] = origin("99"), ["u-gone"] = origin("77") },
            })
            local out = files.record_files(CRM, RECORD)
            test.eq(#out, 3)
            test.eq(out[1].upload_id, "u-1"); test.eq(out[1].error, "too_large")
            test.eq(out[2].upload_id, "u-2"); test.eq(out[2].status, "pending")
            test.eq(out[3].upload_id, "u-old"); test.is_nil(out[3].field); test.eq(out[3].text_available, false)
        end)

        test.it("hides an older active upload when the newest attempt is inactive", function()
            stub({ file_url = "11", edges = {
                edge("old", { provider = "hubspot", ref = "11", attempt = 1, status = "ready" }),
                edge("new", { provider = "hubspot", ref = "11", attempt = 2 }, { active = false }),
            }, origins = { old = origin("11"), new = origin("11") }, texts = { old = "older file" } })
            local out, err = files.record_files(CRM, RECORD)
            test.is_nil(err, tostring(err))
            test.eq(#out, 1)
            test.eq(out[1].status, "pending")
            test.is_nil(out[1].upload_id)
            test.is_nil(out[1].text)
            for _, read in ipairs({ files.record_file_image, files.record_file_url }) do
                local content, read_err = read(CRM, RECORD, "old")
                test.is_nil(content)
                test.eq(errors.is(read_err, errors.PERMISSION_DENIED), true)
            end
        end)

        test.it("answers an empty list for a record without marked values or edges", function()
            local calls = stub({})
            test.eq(#files.record_files(CRM, RECORD), 0)
            test.eq(calls.parse, 0)
            stub({ no_record = true })
            test.eq(#files.record_files(CRM, RECORD), 0)
        end)
    end)

    test.describe("record_file_image", function()
        local original = files.deps
        test.after_each(function() files.deps = original end)

        local world = {
            file_url = "11;22;33",
            edges = {
                edge("u-png", { status = "ready", provider = "hubspot", ref = "22" }),
                edge("u-pdf", { status = "ready", provider = "hubspot", ref = "11" }),
                edge("u-forged", { status = "ready", provider = "hubspot", ref = "33" }),
            },
            origins = { ["u-png"] = origin("22"), ["u-pdf"] = origin("11") },
            images = { ["u-png"] = { artifact_id = "a1", content_type = "image/png" } },
        }

        test.it("returns the original image of an image file of the record", function()
            stub(world)
            local img = files.record_file_image(CRM, RECORD, "u-png")
            test.eq(img.content_type, "image/png")
            test.not_nil(img.content_base64)
            test.eq(img.size, 9)
        end)

        test.it("refuses a document, a foreign upload and an upload without provenance", function()
            stub(world)
            local _, doc_err = files.record_file_image(CRM, RECORD, "u-pdf")
            test.is_true(errors.is(doc_err, errors.INVALID))
            local _, foreign_err = files.record_file_image(CRM, RECORD, "u-elsewhere")
            test.is_true(errors.is(foreign_err, errors.PERMISSION_DENIED))
            local _, forged_err = files.record_file_image(CRM, RECORD, "u-forged")
            test.is_true(errors.is(forged_err, errors.PERMISSION_DENIED))
        end)

        test.it("refuses the image of a file the field no longer names", function()
            local unnamed = {}
            for k, v in pairs(world) do unnamed[k] = v end
            unnamed.file_url = "11"
            stub(unnamed)
            local img, err = files.record_file_image(CRM, RECORD, "u-png")
            test.is_nil(img)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
