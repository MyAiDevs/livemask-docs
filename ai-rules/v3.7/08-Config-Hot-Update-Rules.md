# 08 - Config Hot Update Rules

Config center and hot update work must be versioned, hashed, and reversible.

- PostgreSQL is the source of truth for config history and published state.
- Redis is cache and Pub/Sub only; Redis failure must not corrupt committed DB state.
- Every published config must have monotonic `config_version` and canonical JSON `config_hash`.
- Clients and NodeAgent must validate schema, version, and hash before applying config.
- Rollback creates a new published version; it never rewinds the version counter.
- Staging smoke must verify read path, publish path, Redis cache update, and DB fallback.

