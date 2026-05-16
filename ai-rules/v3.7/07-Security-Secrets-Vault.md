# 07 - Security, Secrets, and Vault Rules

Security-sensitive work must keep secrets out of source control and reports.

- Never commit API keys, wallet values, webhook URLs, signing secrets, private keys, tokens, or database passwords.
- Config payloads may reference secret names, but must not store raw secret values.
- Use environment variables, GitHub Actions secrets, or the approved secret manager for runtime secrets.
- Lark, GitHub, payment, and node identity credentials must be masked in logs and completion reports.
- Admin and internal APIs must define authentication, authorization, audit, and rollback expectations.
- If a secret is exposed, stop development and create a security incident task before continuing.

