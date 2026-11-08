# 测试

## 唯一命令

```bash
npm test
```

`package.json` 里这条命令固定为 `node --test`。本地和 CI 都运行它，不另设第二套测试入口。

运行前使用 `.node-version` 中的精确补丁，并先做干净安装：

```bash
npm ci
npm test
```

`npm ci` 依赖已提交的 `package-lock.json`。当前锁文件只记录根包，没有第三方运行时或测试依赖。以后新增依赖必须锁版本，并在 PR 里说明用途；bootstrap 不新增。

## 钉扎的 Node

2026-11-08 对照 Node.js 官方发布索引与 Release 日程核实：

- 本仓库钉扎 `24.22.2`
- 发布索引中 v24.22.2 的日期是 2026-10-27，`lts` 为 Krypton
- `latest-v24.x` 的 linux-x64 压缩包校验和与 `v24.22.2` 相同
- Release 日程把 24.x 标为 Maintenance LTS，支持到 2028-04-30
- 同一日程上的 Active LTS 是 26.x Lithium；2026-10-28 的最新补丁是 v26.13.0

已批准计划要求 Node 24 LTS 的精确补丁，所以这里使用仍受支持的 24.22.2，不使用浮动的 `lts/*`、`24.x` 或当时的 Active 线 26。`.node-version`、`package.json` 的 `engines.node` 和 CI 的 `node-version-file` 必须保持同一串版本。CI 设置 `check-latest: false`。

官方 `SHASUMS256.txt` 中 `node-v24.22.2-linux-x64.tar.xz` 的 SHA-256：

`48cc0e21e048790e54c0cf5749c2725005313d652651c40b7a21feb9697aaf75`

本机用 nvm 安装时，官方校验和核对通过。CI 由钉扎提交的 `actions/setup-node` 按 `.node-version` 安装，不在工作流里手写另一个版本号。

## 当前测试覆盖什么

`test/scaffold.test.mjs` 检查脚手架本身：

- 当前进程就是钉扎补丁
- `npm test` 是唯一测试脚本，依赖列表为空
- 锁文件只有根包
- 约定文档、工作流和 PR 模板存在
- 工作流权限、触发条件和 Action 提交钉扎
- `pr-required` 在组成 job 不是 `success` 时失败
- 人工初始化的 README 原文仍在
- 介绍页文件还不存在

这些测试不验证未来的介绍页。它们不打开浏览器，不检查 HTML 语义、锚点、溢出、键盘或对比度。页面断言留到 pilot-001 功能 PR。

## 功能 PR 的红绿顺序

1. 先加页面断言，本地 `npm test` 应为非 0，并记录退出码与 SHA
2. 推送后 CI 的 `pr-required` 也应失败。没有分支保护时，这只证明 CI 失败，不证明系统拦住了合并
3. 实现页面，保留同一断言。本地与该 PR head 的 CI 再变为成功
4. 不把红灯测试删掉、改成恒真或 skip

## 人工检查

功能页完成后，由人在本地打开文件，看标题层级、页内导航、窄屏是否横向溢出、键盘是否能到达链接，以及文字对比度。人工项的结果写入 `HANDOFF.md`。未做就写未做。

## CI

`.github/workflows/pr-checks.yml` 在指向 `main` 的 `pull_request` 和推送到 `main` 时运行。权限只有 `contents: read`。测试 job 执行 `npm ci` 与 `npm test`。汇总 job 的名称是 `pr-required`。
