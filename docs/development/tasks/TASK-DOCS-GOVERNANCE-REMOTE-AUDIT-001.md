# TASK-DOCS-GOVERNANCE-REMOTE-AUDIT-001 - Optional Remote Governance Audit

- 状态：Ready
- Owner：Docs / CI-CD
- 创建日期：2026-05-21
- 目标完成日期：
- 主影响仓库：`livemask-docs`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

The repo-native governance base is now in place: task ledger, strict Issue sync,
auto audit center, trace log, active lease registry, and guarded Issue
close/reopen automation. The remaining governance gap is optional remote audit:
checking GitHub Issues, GitHub Actions, and remote `origin/dev` refs without
making the base docs validation flaky or credential-dependent.

## 2. Scope

### In Scope

- Design opt-in remote audit mode for governance checks.
- Keep default `bash scripts/check-docs.sh` offline and deterministic.
- Check GitHub Issue references when a token is available.
- Check GitHub Actions workflow state when requested.
- Check runtime repo `origin/dev` refs against ledger evidence when local sibling
  repos are present.
- Append remote audit results to the existing auto audit trace log.

### Out of Scope

- Making network checks mandatory for local docs validation.
- Auto-closing Issues directly from the remote audit.
- Editing runtime repository code.

## 3. Contracts

- API：Optional GitHub REST / CLI calls with `LIVEMASK_BOT_TOKEN` or
  `GITHUB_TOKEN`.
- Config：Remote audit must be opt-in.
- Events：Audit records appended to `.local-dev/logs/auto-task-center.log` or a
  caller-provided artifact path.
- Error Codes：Gate findings fail only when the remote mode is explicitly
  requested.
- State Machines：Must preserve gate / warning / suggestion separation.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Adds optional remote audit design and tooling | Yes | docs checks + explicit remote dry-run |
| `livemask-ci-cd` | May consume JSON report later | No code in this task unless explicitly scoped | N/A |
| runtime repos | Remote refs may be compared against ledger evidence | No code | dry-run output |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs audit center | GitHub / local repos | opt-in remote check command | Missing token or sibling repo |
| 2 | Remote audit | Docs dispatcher | JSON report + log entry | Ambiguous Issue or stale ref |
| 3 | Docs dispatcher | Next task owner | warning/gate decision | Human/AI review required |

## 6. Implementation Plan

- [ ] Decide whether to extend `scripts/audit-task-center.py` or add a focused
  remote audit script.
- [ ] Add opt-in flags for GitHub Issue, Actions, and remote ref checks.
- [ ] Ensure no remote check runs from base `check-docs.sh`.
- [ ] Preserve JSON report structure.
- [ ] Document exact commands and failure semantics.

## 7. Validation Plan

- [ ] Offline docs checks still pass without token/network.
- [ ] Remote dry-run with missing token reports warning or clear gate only in
  remote mode.
- [ ] Remote ref comparison detects a known mismatch in fixture/sample mode.
- [ ] `bash scripts/check-docs.sh`.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Network audit makes local docs flaky | Developers stop trusting checks | Keep remote mode opt-in | Docs |
| Token lacks repo access | False negatives | Report token/access as warning unless strict remote mode is requested | CI-CD |
| Remote audit auto-mutates state | Wrong Issue/task state | Keep remote audit read-only; use close guard separately | Docs |

## 9. Rollback

- 回滚触发条件：Remote audit produces noisy or non-reproducible results.
- 回滚步骤：Disable remote mode and keep offline audit center unchanged.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- 文档链接：

## 11. Follow-up

- 后续 TASK：Child repo AI rule sync for lease/start/end if remote audit finds
  repeated drift.
- 未完成项：
