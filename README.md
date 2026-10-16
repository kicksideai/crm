<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-dark.png">
  <img src="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-light.png" alt="KickSide" width="320">
</picture>

# KickSide CRM

A Lua module and web component for typed business records. CRM provides object and field schemas, relations, table and board views, imports, search, record history, and agent and automation operations.

A new CRM starts with an empty schema. A consuming module or a user defines the objects, fields, and collections for its domain.

Install `kickside/crm` through **System → Modules**, create a CRM workspace entry, and configure its schema. See the [CRM guide](https://github.com/kicksideai/docs/blob/main/using/crm.md), [module contracts](docs/module.md), and [field configuration](docs/field-config.md).

![CRM with fictional demonstration data: a deals table, the sales pipeline board, and a company record with its activity](https://raw.githubusercontent.com/kicksideai/docs/main/assets/readme/crm-overview.webp)

The repository includes the backend, migrations, Vue web component, and Lua tests for SQLite and PostgreSQL.

License: [KickSide Community License 1.0](LICENSE.md) · [Third-party notices](THIRD_PARTY_NOTICES.md).

[Documentation](https://github.com/kicksideai/docs) · [KickSide](https://kickside.ai)
