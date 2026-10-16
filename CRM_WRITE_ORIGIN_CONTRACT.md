# CRM external-write event vocabulary

CRM owns `kickside.crm.events:external_write.requested`,
`external_write.succeeded`, and `external_write.failed` on its aggregate
thread. These events are the external-write ledger. `external_write.succeeded`
materializes the CRM-owned `kickside_crm_write_origin` projection keyed by
`(crm_id, provider, connection_id, object_type, target_ref, attr)` for bounded
provider-echo suppression. Echo checks must supply every key dimension; writes
to different provider connections or object types never suppress one another.

Consumers call
`lookup(crm_id, provider, connection_id, object_type, target_ref, attr)` or
`matches(crm_id, provider, connection_id, object_type, target_ref, attr, value)`.
Every identity argument is required. An incomplete identity is an error; only a
complete identity with no retained row returns `found = false`.

## Succeeded-write body

Every successful write carries its `provider`, `connection_id`, `target_ref`,
`object_type`, `value_hashes` (`attr -> hash`), `write_ref` (the delivery
idempotency key), `origin` (`run_id`, exact `flow_ref`, `approval_item_id` when
present), and RFC3339 UTC `completed_at`. Requested and failed events carry
the same identity where it is known, so the CRM thread remains the complete
write history.

## Hash normalization

`value_hash` is SHA-256 of canonical JSON for the individual field value.
There is deliberately no trim, case folding, coercion, or provider-specific
cleanup. Scalars use the runtime JSON encoder. Arrays retain index order.
Objects sort their stringified keys lexicographically and recursively encode
values with no whitespace. Empty tables encode as `[]`, matching the CRM
policy implementation.

For a successful multi-field payload, `value_hashes` has one entry per
top-level payload field. A scalar payload uses its declared attribute key.
This is the exact normalization CRM uses for imported values.
