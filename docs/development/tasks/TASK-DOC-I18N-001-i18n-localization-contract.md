# TASK-DOC-I18N-001 — I18N Localization Contract

- 状态：Done
- Owner：Docs / Backend / Admin / Website / App
- 创建日期：2026-05-19
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-admin`, `livemask-website`, `livemask-app`, `livemask-ci-cd`
- 关联里程碑：Product Localization / Website SEO / App UX

## 1. Background

当前 LiveMask 前后端和 App 的可见文案大量为英文。仅把页面上的英文逐个替换为中文会造成维护困难，也无法解决 Backend error、Website SEO、Content locale、App 本地化和 Admin 权限/错误提示的一致性问题。

需要建立统一 i18n 契约：Backend 返回稳定 `code/message_key/params`，客户端根据 locale 渲染中文/英文；Content System 支持 locale；Website 输出 SEO 可采集的中文页面；App 和 Admin 默认支持中文。

## 2. Scope

### In Scope

- 新增 `docs/contracts/i18n/I18N_LOCALIZATION_CONTRACT.md`。
- 定义 MVP locale：`zh-CN`, `en-US`。
- 定义 Backend error contract：`code`, `message`, `message_key`, `params`。
- 定义 Admin / Website / App 本地化要求。
- 定义 Content System locale 和 SEO hreflang 要求。
- 登记后续 Backend/Admin/Website/App/CI-CD 任务。
- 更新 docs 索引和各端 README。

### Out of Scope

- 不直接修改任何代码仓库。
- 不翻译所有现有文案。
- 不引入第三种 locale。
- 不改变现有业务状态机和 enum 值。

## 3. Contracts

- API：Backend errors include `message_key`; content APIs support `locale`.
- Config：Clients persist selected locale; default `zh-CN`, fallback `en-US`.
- Events：Audit/action identifiers remain stable and untranslated in storage.
- Error Codes：Clients translate by `message_key` / `code`.
- State Machines：No domain state is localized in persistence.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 新增 i18n contract 和任务索引 | 是 | `bash scripts/check-docs.sh` |
| `livemask-backend` | 后续支持 locale parser、message_key、content locale | 后续任务 | `TASK-BACKEND-I18N-001` |
| `livemask-admin` | 后续接入 Admin i18n layer、中文默认和语言切换 | 后续任务 | `TASK-ADMIN-I18N-001` |
| `livemask-website` | 后续支持中文 SEO、hreflang、content locale | 后续任务 | `TASK-WEBSITE-I18N-001` |
| `livemask-app` | 后续支持 Flutter localization、语言设置和错误翻译 | 后续任务 | `TASK-APP-I18N-001` |
| `livemask-ci-cd` | 后续增加 i18n smoke | 后续任务 | `TASK-CICD-I18N-001` |
| `livemask-nodeagent` | 无直接 UI 影响；machine enum 不翻译 | 否 | N/A |

## 5. Required Follow-Up Tasks

| TASK | Repo | Purpose |
| --- | --- | --- |
| `TASK-BACKEND-I18N-001` | `livemask-backend` | Locale parser, error `message_key`, content locale/fallback, user `preferred_locale`. |
| `TASK-ADMIN-I18N-001` | `livemask-admin` | Admin translation layer, Chinese default, language switcher, localized errors. |
| `TASK-WEBSITE-I18N-001` | `livemask-website` | Website locale routes/SEO/hreflang/content locale and Chinese default navigation. |
| `TASK-APP-I18N-001` | `livemask-app` | Flutter localization, locale setting, localized errors and content feed locale. |
| `TASK-CICD-I18N-001` | `livemask-ci-cd` | Backend/Admin/Website/App localization smoke checks. |

## 6. Validation

Run:

```bash
bash scripts/check-docs.sh
```

## 7. Completion Evidence

Completion report must include:

- Added contract file.
- Updated indexes/README files.
- Follow-up task list.
- Docs check result.
- Local dev runtime status.
- Confirmation that unrelated working tree files were not committed.

## 8. Local Dev Runtime

This is a docs-only task. Do not run `docker compose down`, `scripts/local-dev.sh stop`, or any local runtime shutdown command.
