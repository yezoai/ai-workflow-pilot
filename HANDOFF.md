# HANDOFF

## 目标

为 `yezoai/ai-workflow-pilot` 建立最小、可审计的 bootstrap 脚手架，供后续 pilot-001 介绍页功能 PR 使用。本棒不实现介绍页。

## 责任执行者

Cursor Cloud Agent 运行 `bc-dd49e642-5b1d-5c12-8f82-fb6c1b62e4a0`，在 Stanley（GitHub `yezoai`）的公开仓库上执行。模型标识为 grok-4.7。合并责任人是 Stanley 本人，不是本代理。

## 允许范围

只改本仓库的任务分支。允许脚手架、文档、原生 Node 测试、PR 模板和 `contents: read` 工作流。不改 `main` 保护、仓库设置、旧 TypeB2B、VPS，不部署，不合并。

## 实际状态

- 基线：`3d42ef5d70a07ac8e8350aeb95be8f5661bc98e0`，仅 `README.md`，内容为 `# ai-workflow-pilot` 加换行
- 任务分支：`cursor/chore-bootstrap-e4a0`。云端代理的分支名必须使用 `cursor/` 前缀和 `-e4a0` 后缀，因此没有使用示例名 `chore/bootstrap`
- Node 钉扎：`24.22.2`（Krypton，Maintenance LTS，官方支持至 2028-04-30）。同日 Active LTS 为 26.x，未采用
- 介绍页：未实现
- 分支保护：未由本代理修改。2026-11-08 读取时 `main.protected` 为 `false`，rulesets 为空；保护详情接口 403
- 验证结果见下一节。CI 若在本节写成“尚未观察”，就不能当成通过

## 最近一次验证

工作目录 `/workspace`，分支 `cursor/chore-bootstrap-e4a0`。PATH 把 nvm 的 Node `v24.22.2` 放在前面。下面是写入这段记录之前的干净安装和测试原文。

```text
$ node -v
v24.22.2
exit:0
$ npm -v
11.19.1
exit:0
$ npm ci

up to date, audited 1 package in 178ms

found 0 vulnerabilities
exit:0
$ npm test

> ai-workflow-pilot@0.0.0 test
> node --test

✔ runs on the exact Node patch pinned in .node-version (1.560893ms)
✔ npm test is the only test command and there are no third-party dependencies (0.586064ms)
✔ package-lock.json records only the root package (0.164283ms)
✔ bootstrap documents and the human README are present (0.487543ms)
✔ workflow is least privilege and pins action commits (0.422162ms)
✔ pr-required fails closed unless every constituent result is success (0.163486ms)
✔ scaffold tests do not verify a future introduction page (0.24562ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 59.994942
exit:0
```

零依赖时这次 `npm ci` 没有创建 `node_modules`。`.gitignore` 仍忽略该目录。`README.md` 相对基线 `3d42ef5d70a07ac8e8350aeb95be8f5661bc98e0` 的 diff 为空，字节为 `# ai-workflow-pilot\n`。

Node 安装：nvm 下载 `https://nodejs.org/dist/v24.22.2/node-v24.22.2-linux-x64.tar.xz` 后报告 `Checksums matched`。官方 `SHASUMS256.txt` 与 `latest-v24.x` 都给出 SHA-256 `48cc0e21e048790e54c0cf5749c2725005313d652651c40b7a21feb9697aaf75`。

汇总 job 的判断在本地用同一条件执行，不是 CI：

```text
success exit:0
failure exit:1
cancelled exit:1
skipped exit:1
empty exit:1
```

工作流静态检查：

- `actionlint` 1.7.12，命令 `/tmp/actionlint/actionlint -no-color .github/workflows/pr-checks.yml`，退出码 0。发行包 SHA-256 `8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8` 与官方 checksums 一致。
- 装上 ShellCheck 0.9.0 后重跑 actionlint，退出码仍为 0。四个 `run` 脚本单独 `shellcheck -s bash` 也是退出码 0。
- actionlint 调试输出写明这两个 Action SHA 不在它内置的 popular actions 数据里，因此它没有核对 Action 输入项。输入项是对照该提交上的 `action.yml` 人工核对的：checkout `3d3c42e5aac5ba805825da76410c181273ba90b1` 有 `persist-credentials`；setup-node `949feb2413d6458794dcd2491c4babbbce0c15c1` 有 `node-version-file`、`check-latest`、`package-manager-cache`。
- PyYAML 语义检查退出码 0。检查器把 YAML 1.1 把 `on` 读成布尔值的情况改回 `on` 后再断言触发器、权限、SHA 和 `pr-required` 逻辑。
- 这些静态检查不代替 GitHub Actions 的真实运行。本提交当时还没有 CI 结论。

CI 状态不能写进产生它的同一个提交里冒充已经通过。开 PR 后只按该 head SHA 的 Actions 运行记录结论；pending 不是 success。

把上面的验证段写入 `HANDOFF.md` 之后，立刻复跑了一次 `npm test`。原文如下。测试不检查本段文字，因此把原文补进文件不再次跑测试。

```text
$ npm test

> ai-workflow-pilot@0.0.0 test
> node --test

✔ runs on the exact Node patch pinned in .node-version (1.50109ms)
✔ npm test is the only test command and there are no third-party dependencies (0.574794ms)
✔ package-lock.json records only the root package (0.160343ms)
✔ bootstrap documents and the human README are present (0.463687ms)
✔ workflow is least privilege and pins action commits (0.428939ms)
✔ pr-required fails closed unless every constituent result is success (0.157118ms)
✔ scaffold tests do not verify a future introduction page (0.205712ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 58.707547
exit:0
```

## 费用

本次云端代理运行的 token、耗时账单不可得，记为未知。没有新增付费审查服务。

## 阻塞

无实现阻塞。分支保护详情接口 403，只能确认分支对象上的 `protected: false` 和空的 rulesets 列表，不能读取保护文档全文。这不阻塞脚手架 PR。必需检查尚未选择，因为名为 `pr-required` 的检查还需要先真实运行。

## 下一棒

1. 打开 bootstrap PR，记录精确 head SHA，以及该 SHA 上 `pr-required` 的真实状态和运行链接
2. Stanley 审阅 diff、本地证据和 CI。他决定是否合并，以及是否在检查出现后手工设置 `docs/pr-policy.md` 里的未应用保护
3. 合并后的 `main` push 需要单独的 CI 证据。功能红灯与绿灯、M5 上的 Codex 精确 head 审查，都属于介绍页 PR，不属于本棒
