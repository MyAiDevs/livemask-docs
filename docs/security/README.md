# Security 文档入口

## 1. 职责范围

本目录承接认证授权、Secret 管理、请求签名、客户端安全、风控、灾备演练和安全审计相关文档。

## 2. 当前资料位置

安全相关历史文档目前分布在：

- `docs/security/AUTH_RBAC_SECURITY_MODEL.md`
- `docs/app/LiveMask_App客户端开发与加密安全规范_v3.6.md`
- `docs/archive/LiveMask_统一Secret管理与灾备演练机制设计_v3.6.md`
- `docs/archive/LiveMask_防刷机制设计_v3.6.md`
- `docs/operations/LiveMask_运营手册_v3.6.md`

## 3. 闭环要求

- [ ] 所有安全变更必须关联 `TASK-XXXX`
- [ ] 必须说明威胁模型、影响范围、回滚策略和验证结果
- [ ] Secret、支付、权限、风控相关变更必须记录审计字段
- [ ] 涉及 App / Backend / NodeAgent 的协议变化必须完成兼容性检查

## 4. 后续整理

后续将 archive 中仍在使用的安全文档迁移到本目录，并在迁移 PR 中保留旧路径索引。
