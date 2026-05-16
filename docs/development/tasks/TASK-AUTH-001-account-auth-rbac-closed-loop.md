# TASK-AUTH-001 - Account / Auth / RBAC 基础闭环

- 状态：Ready
- Owner：Backend / Security
- 创建日期：2026-05-17
- 目标完成日期：MVP P0
- 主影响仓库：`livemask-backend`
- 受影响仓库：`livemask-admin`, `livemask-website`, `livemask-app`, `livemask-docs`, `livemask-ci-cd`
- 关联里程碑：MVP Identity Foundation

## 1. Background

当前配置中心、Admin 页面、App 远程配置、NodeAgent 配置同步已经进入可开发状态，但缺少统一账号、登录态、权限和路由隔离。

如果没有 Auth/RBAC 闭环，后续订阅、设备、C2C、积分、支付、Admin 审批、赞助大使收益和推广大使收益都会缺少安全边界。因此本任务必须在继续支付/订阅/C2C 之前完成。

## 2. Scope

### In Scope

- 用户注册、登录、刷新、登出、当前用户信息。
- App / Website / Admin 共用账号体系。
- Admin、Sponsor Ambassador、Promotion Ambassador 使用同一个后台产品，但必须按路由命名空间和角色隔离。
- JWT access token + refresh token rotation。
- Backend RBAC 中间件和权限表。
- Admin 用户列表和角色管理最小 API。
- Admin / Website / App 登录态接入。
- API smoke 用例覆盖 Auth 基础链路。

### Out of Scope

- 完整 MFA 正式上线。
- OAuth / 第三方登录。
- KYC。
- 完整用户资料系统。
- 完整订阅、设备、C2C、积分业务实现。
- 生产级风控模型。

## 3. Contracts

- API：[../../contracts/api/auth-rbac.md](../../contracts/api/auth-rbac.md)
- Security：[../../security/AUTH_RBAC_SECURITY_MODEL.md](../../security/AUTH_RBAC_SECURITY_MODEL.md)
- Cursor handoff：[../cursor-handoffs/AUTH-001-CURSOR_HANDOFF.md](../cursor-handoffs/AUTH-001-CURSOR_HANDOFF.md)
- Error Codes：见 `auth-rbac.md#7-error-codes`
- Events：后续可补 `auth.session_created`, `auth.role_changed`
- State Machines：Session lifecycle: active -> refreshed -> revoked -> expired

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | Auth/RBAC 核心实现 | DB schema, password hash, token issue/refresh/revoke, RBAC middleware, audit logs | Go tests, integration tests, API smoke |
| `livemask-admin` | 登录和权限守卫 | Login page, auth store, protected routes, 401/403 handling, role-aware navigation | `npm run build`, manual local runtime |
| `livemask-website` | 官网登录/注册入口和用户门户壳 | `/login`, `/register`, auth callback, account shell, subscription/device/C2C entry placeholders | `npm run build`, local UI check |
| `livemask-app` | App 登录态 | secure token storage, refresh interceptor, logout, `/api/v1/me` integration | Flutter tests, manual login flow |
| `livemask-ci-cd` | API smoke | Add auth cases to `scripts/api-smoke-cases.tsv` after backend endpoints exist | `bash scripts/api-smoke.sh` |
| `livemask-docs` | 契约和任务闭环 | Task, API contract, security model | `bash scripts/check-docs.sh` |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs / Product | Backend | `auth-rbac.md`, role matrix, route namespace rules | 契约不可测试 |
| 2 | Backend | Admin / Website / App | Endpoints, error codes, token behavior, local API smoke | 登录/刷新契约缺失 |
| 3 | Backend | CI/CD | API smoke auth cases and local runtime command | 无法自动验证 |
| 4 | Admin / Website / App | QA | UI routes, 401/403 behavior, token storage notes | 权限边界不清 |
| 5 | QA / Security | Product | Test evidence, residual risks, follow-up tasks | 角色越权或 session 风险 |

## 6. Implementation Plan

### Backend

- [ ] Add users, roles, user_roles, sessions, audit_logs schema.
- [ ] Implement password hashing and validation.
- [ ] Implement `POST /api/v1/auth/register`.
- [ ] Implement `POST /api/v1/auth/login`.
- [ ] Implement `POST /api/v1/auth/refresh` with refresh token rotation.
- [ ] Implement `POST /api/v1/auth/logout`.
- [ ] Implement `GET /api/v1/me`.
- [ ] Implement `GET /admin/api/v1/auth/me`.
- [ ] Implement RBAC middleware for `/admin/api/v1/*`.
- [ ] Implement `GET /admin/api/v1/users`.
- [ ] Implement `POST /admin/api/v1/users/{user_id}/roles`.
- [ ] Add audit logs for privileged actions.
- [ ] Seed one local `super_admin` account through environment or dev-only seed script.

### Admin

- [ ] Add login page.
- [ ] Add auth provider/store.
- [ ] Protect `/admin/*`, `/sponsor/*`, `/ambassador/*`.
- [ ] Add 401 logout and 403 no-permission screens.
- [ ] Hide/show nav items by permission.
- [ ] Add minimal user list and role assignment UI if backend endpoint is ready.

### Website

- [ ] Add `/login`, `/register`, `/forgot-password`, `/verify-email`, `/auth/callback`.
- [ ] Add authenticated account shell.
- [ ] Add placeholders/entry cards for subscription, devices, C2C market, points, support.
- [ ] Ensure no public website route is placed under `/admin/*`, `/sponsor/*`, or `/ambassador/*`.

### App

- [ ] Add login/logout service.
- [ ] Store tokens in platform secure storage.
- [ ] Add refresh-on-401 once.
- [ ] Add `/api/v1/me` bootstrap.
- [ ] Make remote config and future user APIs share the authenticated API client.

### CI/CD

- [ ] Add auth API smoke cases after Backend endpoints exist.
- [ ] Include register/login/me/refresh/logout in local smoke.

## 7. Validation Plan

- [ ] Backend unit tests for password hash, JWT claims, permission checks.
- [ ] Backend integration test: register -> login -> me -> refresh -> logout.
- [ ] Admin normal `user` cannot call `/admin/api/v1/auth/me`.
- [ ] Sponsor ambassador cannot enter `/ambassador/*`.
- [ ] Promotion ambassador cannot enter `/sponsor/*`.
- [ ] `role:manage` required for role assignment.
- [ ] Refresh token reuse revokes session family.
- [ ] API smoke passes against local Docker runtime.
- [ ] Admin build passes.
- [ ] Website build passes.
- [ ] App tests pass.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Token 存储不一致 | App/Web/Admin 登录态混乱 | 明确 App secure storage、Web/Admin cookie/CSRF | Security |
| 前端只做菜单隐藏 | 越权访问 | Backend 必须 server-side RBAC | Backend |
| 角色命名漂移 | 多端判断不一致 | `auth-rbac.md` 固定 role string | Docs |
| 生产 super_admin 创建不安全 | 权限泄露 | 本地 seed 和生产初始化分开，生产必须手动受控 | Ops |
| Refresh token 未轮换 | token 被盗风险 | Rotation + reuse detection | Backend |

## 9. Rollback

- 回滚触发条件：登录不可用、权限误拒/误放、token 刷新异常、Admin 无法进入。
- 回滚步骤：
  - Revert backend Auth/RBAC commit.
  - Temporarily disable Admin protected route integration if backend rollback.
  - Restore previous local runtime and smoke cases.
- 回滚验证：
  - `/api/v1/health` ok.
  - `/api/v1/config/client` ok.
  - Admin config page restores previous behavior in dev-local.

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- API smoke output：
- Admin / Website / App screenshots：
- 文档链接：
  - `docs/contracts/api/auth-rbac.md`
  - `docs/security/AUTH_RBAC_SECURITY_MODEL.md`

## 11. Follow-up

- TASK-AUTH-002：Email verification + password reset.
- TASK-AUTH-003：MFA and device trust.
- TASK-RBAC-002：Fine-grained Admin approval and audit workflow.
- TASK-SUBSCRIPTION-001：Website/App subscription entitlement.
- TASK-DEVICE-001：Device management and device limit enforcement.
