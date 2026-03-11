# OpenAI Agents Python Skills 汇总文档

本文档汇总了 `openai-agents-python` 项目中所有 Skills 的中文翻译版本。

---

## 目录

1. [code-change-verification (代码变更验证)](#1-code-change-verification-代码变更验证)
2. [docs-sync (文档同步)](#2-docs-sync-文档同步)
3. [examples-auto-run (示例自动运行)](#3-examples-auto-run-示例自动运行)
4. [final-release-review (最终发布审查)](#4-final-release-review-最终发布审查)
5. [implementation-strategy (实现策略)](#5-implementation-strategy-实现策略)
6. [openai-knowledge (OpenAI 知识)](#6-openai-knowledge-openai-知识)
7. [pr-draft-summary (PR 草稿摘要)](#7-pr-draft-summary-pr-草稿摘要)
8. [test-coverage-improver (测试覆盖率改进)](#8-test-coverage-improver-测试覆盖率改进)

---

## 1. code-change-verification (代码变更验证)

**名称**: code-change-verification
**描述**: 当代码变更影响运行时代码、测试或构建/测试配置时，运行强制验证流程。

### 概述

确保只有在格式化、linting、类型检查和测试通过后才能标记工作完成。当代码变更影响运行时代码、测试或构建/测试配置时使用此技能。对于仅涉及文档或仓库元数据的变更可以跳过，除非用户要求完整验证流程。

### 快速开始

1. 将此技能保持在 `./.agents/skills/code-change-verification` 以便自动加载
2. macOS/Linux: `bash .agents/skills/code-change-verification/scripts/run.sh`
3. Windows: `powershell -ExecutionPolicy Bypass -File .agents/skills/code-change-verification/scripts/run.ps1`
4. 如果任何命令失败，修复问题后重新运行脚本并报告失败输出
5. 确认所有命令成功且无遗留问题后才确认完成

### 手动工作流程

安装或已更改，先- 如果依赖未运行 `make sync` 通过 `uv` 安装开发依赖
- 从仓库根目录按顺序运行: `make format` → `make lint` → `make typecheck` → `make tests`
- 不要跳过步骤; 命令失败时立即停止并修复问题
- 应用修复后重新运行完整验证流程，以确保命令按所需顺序执行

### 资源

#### scripts/run.sh

- 从仓库根目录执行完整验证序列，具有 fail-fast 语义。优先使用此入口点以确保命令按正确顺序运行。

#### scripts/run.ps1

- Windows 友好的包装器，使用相同的验证序列和 fail-fast 语义。在需要绕过执行策略的环境中使用。

---

## 2. docs-sync (文档同步)

**名称**: docs-sync
**描述**: 分析 main 分支的实现和配置，找出 docs/ 中缺失、不正确或过时的文档。用于审计文档覆盖率、同步文档与代码或提出文档更新/结构变更。仅更新 docs/** 下的英文文档，从不触碰 docs/ja、docs/ko 或 docs/zh 下的翻译文档。提供报告并在编辑文档前请求批准。

### 概述

通过将 main 分支的功能和配置选项与当前文档结构进行比较，识别文档覆盖差距和不准确之处，然后提出有针对性的改进建议。

### 工作流程

1. **确认范围和基础分支**
   - 识别当前分支和默认分支（通常是 `main`）
   - 优先分析当前分支以保持与进行中的变更对齐
   - 如果当前分支不是 `main`，仅分析 vs `main` 的差异以确定文档更新范围
   - 如果切换分支会破坏本地变更，使用 `git show main:<path>` 或 `git worktree add`

2. **从选定范围构建功能清单**
   - 如果在 `main` 上: 清点完整表面区域并全面审查文档
   - 如果不在 `main` 上: 仅清点 vs `main` 的变更（功能添加/变更/移除）
   - 关注面向用户的行为: 公共导出、配置选项、环境变量、CLI 命令、默认值和记录的运行时行为
   - 为每个项目捕获证据（文件路径 + 符号/设置）
   - 使用有针对性的搜索查找选项类型和功能标志（例如: `rg "Settings"`, `rg "Config"`, `rg "os.environ"`, `rg "OPENAI_"`）
   - 当主题涉及 OpenAI 平台功能时，调用 `$openai-knowledge` 从 OpenAI 开发者文档 MCP 服务器获取最新详情，同时将 SDK 源代码视为事实来源

3. **文档优先审查: 审查现有页面**
   - 遍历 `docs/` 下每个相关页面（排除 `docs/ja`、`docs/ko` 和 `docs/zh`）
   - 识别对重要支持选项（可选标志、环境变量）、定制点或来自 `src/agents/` 和 `examples/` 的新功能的遗漏提及
   - 在用户合理期望在该页面找到的地方提出添加建议

4. **代码优先审查: 将功能映射到文档**
   - 审查 `docs/` 和 `mkdocs.yml` 下的当前文档信息架构
   - 根据现有模式和 `docs/ref` 下的 API 参考结构，确定每个功能的最佳页面/部分
   - 识别缺少任何文档页面或有页面但没有相应内容的功能
   - 注意何时结构调整可以提高可发现性
   - 改进 `docs/ref/*` 页面时，将 `src/` 中相应的文档字符串/注释视为事实来源。优先更新那些代码注释，以便重新生成的参考文档保持正确，而不是手动编辑生成的页面。

5. **检测差距和不准确之处**
   - **缺失**: main 中存在但文档中缺少的功能/配置
   - **不正确/过时**: 与 main 不同的名称、默认值或行为
   - **结构问题**（可选）: 页面过载、缺少概述或主题分组不当

6. **生成文档同步报告并请求批准**
   - 提供带有证据、建议的文档位置和拟议编辑的清晰报告
   - 询问用户是否继续进行文档更新

7. **如果获批，应用变更（仅英文）**
   - 仅编辑 `docs/**` 中的英文文档
   - **不要**编辑 `docs/ja`、`docs/ko` 或 `docs/zh`
   - 保持变更与现有文档风格和导航对齐
   - 添加或重命名页面时更新 `mkdocs.yml`
   - 编辑后使用 `make build-docs` 构建文档以验证文档站点仍能构建

### 输出格式

使用此模板报告发现:

```
Docs Sync Report

- Doc-first findings
  - Page + missing content -> evidence + suggested insertion point
- Code-first gaps
  - Feature + evidence -> suggested doc page/section (or missing page)
- Incorrect or outdated docs
  - Doc file + issue + correct info + evidence
- Structural suggestions (optional)
  - Proposed change + rationale
- Proposed edits
  - Doc file -> concise change summary
- Questions for the user
```

### 参考资料

- `references/doc-coverage-checklist.md`

---

## 3. examples-auto-run (示例自动运行)

**名称**: examples-auto-run
**描述**: 在自动模式下运行 Python 示例，带有日志、重跑辅助和后台控制。

### 功能

- 运行 `uv run examples/run_examples.py`，带有:
  - `EXAMPLES_INTERACTIVE_MODE=auto`（自动输入/自动批准）
  - 每个示例的日志在 `.tmp/examples-start-logs/` 下
  - 主摘要日志路径通过 `--main-log` 传递（也在 `.tmp/examples-start-logs/` 下）
  - 设置 `--write-rerun` 时在 `.tmp/examples-rerun.txt` 生成失败重跑列表
- 通过 `run.sh` 提供 start/stop/status/logs/tail/collect/rerun 辅助函数
- 后台选项保持进程运行并带有 pidfile；`stop` 清理它

### 使用方法

```bash
# 启动（自动模式；交互默认包含）
.agents/skills/examples-auto-run/scripts/run.sh start [extra args to run_examples.py]
# 示例：
.agents/skills/examples-auto-run/scripts/run.sh start --filter basic
.agents/skills/examples-auto-run/scripts/run.sh start --include-server --include-audio

# 查看状态
.agents/skills/examples-auto-run/scripts/run.sh status

# 停止运行中的任务
.agents/skills/examples-auto-run/scripts/run.sh stop

# 列出日志
.agents/skills/examples-auto-run/scripts/run.sh logs

# 查看最新日志（或指定一个）
.agents/skills/examples-auto-run/scripts/run.sh tail
.agents/skills/examples-auto-run/scripts/run.sh tail main_20260113-123000.log

# 从主日志收集重跑列表（默认为最新的 main_*.log）
.agents/skills/examples-auto-run/scripts/run.sh collect

# 仅重跑重跑文件中的失败项（自动模式）
.agents/skills/examples-auto-run/scripts/run.sh rerun
```

### 可通过环境变量覆盖的默认值

- `EXAMPLES_INTERACTIVE_MODE=auto`
- `EXAMPLES_INCLUDE_INTERACTIVE=1`
- `EXAMPLES_INCLUDE_SERVER=0`
- `EXAMPLES_INCLUDE_AUDIO=0`
- `EXAMPLES_INCLUDE_EXTERNAL=0`
- 自动模式中的自动批准: `APPLY_PATCH_AUTO_APPROVE=1`, `SHELL_AUTO_APPROVE=1`, `AUTO_APPROVE_MCP=1`

### 日志位置

- 主日志: `.tmp/examples-start-logs/main_*.log`
- 每个示例的日志（来自 `run_examples.py`）: `.tmp/examples-start-logs/<module_path>.log`
- 重跑列表: `.tmp/examples-rerun.txt`
- 标准输出日志: `.tmp/examples-start-logs/stdout_*.log`

### 注意

- 运行器委托给 `uv run examples/run_examples.py`，该脚本已写入每个示例的日志并支持 `--collect`、`--rerun-file` 和 `--print-auto-skip`
- `start` 使用 `--write-rerun` 以自动捕获失败
- 如果 `.tmp/examples-rerun.txt` 存在且不为空，调用技能时不带参数默认运行 `rerun`

### 行为验证（Codex/LLM 责任）

运行器不执行任何自动行为验证。在每次前台 `start` 或 `rerun` 后，**Codex 必须手动验证**所有 exit-0 的条目:

1. 阅读示例源代码（和注释）以推断预期流程、使用的工具和预期关键输出
2. 打开 `.tmp/examples-start-logs/` 下相应的每个示例日志
3. 确认预期的操作/结果发生了；标记遗漏或差异
4. 对**所有通过的示例**执行此操作，而不仅仅是抽样
5. 运行后立即报告，引用证明验证正确的具体日志行

---

## 4. final-release-review (最终发布审查)

**名称**: final-release-review
**描述**: 通过定位上一个发布标签并审查差异（例如 v1.2.3...<commit>）来执行发布就绪审查，审查破坏性变更、回归、改进机会和发布风险。

### 目的

在验证最新发布候选提交（默认为 `origin/main` 尖端）用于发布时使用此技能。它引导你获取远程标签，选择上一个发布标签，并彻底检查 `BASE_TAG...TARGET` 差异，寻找破坏性变更、引入的 bug/回归、改进机会和发布风险。

审查必须稳定且可操作：通过使用明确的门控规则避免运行之间的差异，切勿在没有具体证据和明确解锁操作的情况下产生 `BLOCKED` 调用。

### 快速开始

1. 确保在仓库根目录: `pwd` → `path-to-workspace/openai-agents-python`
2. 同步标签并选择基础（默认 `v*`）:
   ```bash
   BASE_TAG="$(.agents/skills/final-release-review/scripts/find_latest_release_tag.sh origin 'v*')"
   ```
3. 选择目标提交（默认为 `origin/main` 尖端，确保最新）: `git fetch origin main --prune` 然后 `TARGET="$(git rev-parse origin/main)"`
4. 快照范围:
   ```bash
   git diff --stat "${BASE_TAG}"..."${TARGET}"
   git diff --dirstat=files,0 "${BASE_TAG}"..."${TARGET}"
   git log --oneline --reverse "${BASE_TAG}".."${TARGET}"
   git diff --name-status "${BASE_TAG}"..."${TARGET}"
   ```
5. 使用 `references/review-checklist.md` 进行深入审查，发现破坏性变更、回归和改进机会
6. 捕获发现并调用发布门控：带条件发货/阻止；为风险领域提出有针对性的测试

### 确定性的门控策略

- 默认 **🟢 绿灯通过**，除非满足以下至少一个阻塞触发条件
- 仅在可以引用具体发布阻塞证据并提供可操作的解锁步骤时使用 **🔴 阻塞**
- 阻塞触发条件（需要至少一个才能触发 `BLOCKED`）:
  - 确认的回归或 bug 在 `BASE...TARGET` 中引入（例如，针对性测试失败、差异中的不兼容行为或移除行为且无回退）
  - 确认的破坏性公共 API/协议/配置变更，版本号缺失或不匹配且无迁移路径（例如，为破坏性变更发布补丁版本）
  - 具体的数据丢失、损坏或影响安全性的变更且未缓解
  - 发布关键的打包/构建/运行时路径被差异破坏（不是推测性的）
- 本身非阻塞:
  - 大量差异大小、广泛的重构或许多更改的文件
  - 没有具体证据的"可能回归"风险陈述
  - 本地未运行测试
- 如果证据不完整，发出 **🟢 绿灯通过** 并带有有针对性的验证后续步骤，而不是 `BLOCKED`

### 工作流程

- **准备**
  - 运行快速开始标签命令以确保使用最新的远程标签。如果标签模式不同，覆盖模式参数（例如 `'*.*.*'`）
  - 如果用户指定基础标签，仍优先使用它但先获取远程标签
  - 保持工作树干净以避免差异噪音

- **假设**
  - 假设目标提交（默认为 `origin/main` 尖端）已在 CI 中通过 `$code-change-verification`，除非用户另有说明
  - 不要仅仅因为本地未运行测试而阻止发布；专注于具体的行为或 API 风险
  - 发布策略：常规发布使用补丁版本；仅在破坏性变更或重大功能添加时使用 minor。Major 版本保留到 1.0 发布

- **映射差异**
  - 使用 `--stat`、`--dirstat` 和 `--name-status` 输出发现热门目录和文件类型
  - 对于可疑文件，优先使用 `git diff --word-diff BASE...TARGET -- <path>`
  - 注意任何删除或新添加的测试、配置、迁移或脚本

- **分析风险**
  - 遍历 `references/review-checklist.md` 中的类别（破坏性变更、回归线索、改进机会）
  - 当你怀疑风险时，引用具体文件/提交并解释行为影响
  - 每个发现都要包含：`Evidence`、`Impact` 和 `Action`
  - 严重性校准:
    - **🟢 低**: 低爆炸半径或明显覆盖的行为；无发布门控影响
    - **🟡 中等**: 看似合理的面向用户回归信号；需要验证但不是确认的阻塞器
    - **🔴 高**: 确认或有力证据支持的发布阻塞问题
  - 时间紧迫时，建议最小化、高信号的验证命令（针对性测试或 linters）而不是通用重跑
  - 破坏性变更在已有适当版本升级和迁移/升级说明覆盖时不会自动要求 BLOCKED 发布调用；仅当版本升级缺失/不匹配（例如补丁升级）或破坏性变更引入未解决的风险时才阻止

- **形成建议**
  - 明确说明 BASE_TAG 和 TARGET
  - 提供简洁的差异摘要（关键目录/文件和计数）
  - 列出：破坏性变更候选、可能的回归/bug、改进机会、缺失的发布说明/迁移
  - 推荐发货/阻止以及如果阻塞时需要的确切检查项。如果破坏性变更已正确版本化（minor/major），你仍可能推荐绿灯通过，同时指出变更。在发布调用中使用 emoji 和粗体使门控显而易见
  - 如果你无法提供具体的解锁检查项，不要使用 `BLOCKED`

### 输出格式（必需）

所有输出必须为英文。

在技能产生的每个响应中使用以下报告结构。主动且果断：在顶部附近做出明确的发货/阻止调用，并为每个发现分配明确的风险级别（低/中/高），附上简短的影响陈述。当风险较低且测试通过时，避免过度谨慎的套话。

始终在 Diff 部分使用固定的仓库 URL（`https://github.com/openai/openai-agents-python/compare/...`）。不要使用 `${GITHUB_REPOSITORY}` 或任何其他模板变量。将风险级别格式化为粗体 emoji 标签：**🟢 低**、**🟡 中等**、**🔴 高**。

每个风险发现必须包含可操作的下一步。如果报告使用 `**🔴 BLOCKED**`，包含一个 `Unblock checklist` 部分，至少包含一个具体命令/任务和通过条件。

```
### Release readiness review (<tag> -> TARGET <ref>)

This is a release readiness report done by `$final-release-review` skill.

### Diff

https://github.com/openai/openai-agents-python/compare/<tag>...<target-commit>

### Release call:
**<🟢 GREEN LIGHT TO SHIP | 🔴 BLOCKED>** <one-line rationale>

### Scope summary:
- <N files changed (+A/-D); key areas touched: ...>

### Risk assessment (ordered by impact):
1) <Finding title>
   - Risk: <🟢 LOW | 🟡 MODERATE | 🔴 HIGH>. <Impact statement in one sentence.>
   - Evidence: <specific diff/test/commit signal; avoid generic statements>
   - Files: <path(s)>
   - Action: <concrete next step command/task with pass criteria>
2) ...

### Unblock checklist (required when Release call is BLOCKED):
1. [ ] <concrete check/fix>
   - Exit criteria: <what must be true to unblock>
2. ...

### Notes:
- <working tree status, tag/target assumptions, or re-run guidance>
```

如果没有发现风险，在 Risk assessment 下包含"No material risks identified"行，但仍提供发货调用。如果未进行本地验证，不要添加验证状态部分或将其用作发布阻塞器；在 Notes 中简要说明任何假设。
如果报告未被阻止，省略 `Unblock checklist` 部分。

### 资源

- `scripts/find_latest_release_tag.sh`: 获取远程标签并返回匹配模式（默认 `v*`）的最新标签
- `references/review-checklist.md`: 用于发现破坏性变更、回归和发布完善差距的详细信号和命令

---

## 5. implementation-strategy (实现策略)

**名称**: implementation-strategy
**描述**: 在编辑代码前决定如何实现 openai-agents-python 中的运行时和 API 变更。当任务更改导出的 API、运行时行为、序列化状态、测试或文档且需要选择兼容性边界、是否需要填充层或迁移，以及何时可以直接重写未发布的接口时使用。

### 概述

在编辑代码前使用此技能，当任务改变运行时行为或可能看起来像兼容性关注点时。目标是保持实现简单，同时保护真正发布的合约。

### 快速开始

1. 识别你正在更改的表面: 发布的公共 API、分支本地的未发布 API、内部辅助函数、持久化模式、wire 协议、CLI/配置/环境表面，或仅文档/示例
2. 确定最新的发布边界:
   ```bash
   BASE_TAG="$(.agents/skills/final-release-review/scripts/find_latest_release_tag.sh origin 'v*' 2>/dev/null || git tag -l 'v*' --sort=-v:refname | head -n1)"
   echo "$BASE_TAG"
   ```
3. 根据最新发布标签判断破坏性变更风险，而不是根据未发布的分支变动或 main 上标签后的更改
4. 优先满足当前任务的最简单实现。直接更新调用者、测试、文档和示例，而不是保留被超越的未发布接口
5. 仅在存在具体的发布消费者或明确支持的持久化外部状态边界需要它时，或当用户明确要求迁移路径时，才添加兼容性层

### 兼容性边界规则

- 发布的公共 API 或记录的外部行为: 保持兼容或提供明确的迁移路径
- 持久化模式、序列化状态、wire 协议、CLI 标志、环境变量和外部使用的配置: 当它们是最新发布的一部分或仓库明确打算跨提交、进程或机器保留它们时，视为兼容性敏感
- Python 特定的持久化表面，如 `RunState`、会话持久化、导出的 dataclass 构造函数顺序和记录的模型/提供者配置，在它们是最新发布标签的一部分或被明确支持为共享持久化边界时应视为兼容性敏感
- 仅在当前分支引入的接口变更: 不是兼容性目标。直接重写它们
- 存在于 `main` 但在最新发布标签后添加的接口变更: 本身不是 semver 破坏性变更。直接重写它们，除非它们已经定义了发布或明确支持的持久化外部状态边界
- 内部辅助函数、私有类型、同分支测试、fixtures 和示例: 直接更新它们，而不是添加适配器
- main 上未发布的持久化模式版本在有意不支持中间快照时可以重新编号或合并。当你这样做时，一并更新支持集和测试，使边界明确

### 默认实现立场

- 优先删除或替换，而不是别名、重载、填充层、功能标志和双写逻辑，当旧形状未发布时
- 不要仅仅因为当前分支差异中存在某个令人困惑的抽象就保留它
- 如果审查反馈声称变更是破坏性的，根据最新发布标签和实际外部影响验证反馈，然后再接受反馈
- 如果变更确实跨越了最新发布的合约边界，在 ExecPlan、发布说明上下文和面向用户的摘要中明确指出

### 何时停止并确认

- 变更将改变最新发布标签中附带的行为
- 变更将修改持久的外部数据、协议格式或序列化状态
- 用户明确要求向后兼容性、弃用或迁移支持

### 输出期望

当此技能实质性地影响实现方法时，在你的推理或交接中简要说明决定，例如:

- `Compatibility boundary: latest release tag v0.x.y; branch-local interface rewrite, no shim needed.`
- `Compatibility boundary: released RunState schema; preserve compatibility and add migration coverage.`

---

## 6. openai-knowledge (OpenAI 知识)

**名称**: openai-knowledge
**描述**: 在使用 OpenAI API（Responses API）或 OpenAI 平台功能（工具、流式传输、Realtime API、认证、模型、速率限制、MCP）且需要权威、最新的文档（模式、示例、限制、边缘情况）时使用。优先使用可用的 OpenAI 开发者文档 MCP 服务器工具；否则引导用户启用 `openaiDeveloperDocs`。

### 概述

使用 OpenAI 开发者文档 MCP 服务器搜索和获取精确的文档（markdown），然后基于该文本回答，而不是猜测。

### 工作流程

#### 1) 检查 Docs MCP 服务器是否可用

如果 `mcp__openaiDeveloperDocs__*` 工具可用，使用它们。

如果不确定，运行 `codex mcp list` 并检查 `openaiDeveloperDocs`。

#### 2) 使用 MCP 工具获取精确文档

- 首先搜索，然后获取具体页面或页面
  - `mcp__openaiDeveloperDocs__search_openai_docs` → 选择最佳 URL
  - `mcp__openaiDeveloperDocs__fetch_openai_doc` → 检索精确的 markdown（可选择带有 `anchor`）
- 当需要端点模式或参数时，使用:
  - `mcp__openaiDeveloperDocs__get_openapi_spec`
  - `mcp__openaiDeveloperDocs__list_api_endpoints`

基于获取的文本回答并精确引用或复述。不要发明标志、字段名、默认值或限制。

#### 3) 如果未配置 MCP，引导设置（除非要求，否则不更改配置）

提供以下设置选项之一，然后要求用户重启 Codex 会话以加载工具:

- CLI:
  - `codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp`
- 配置文件（`~/.codex/config.toml`）:
  - 添加:
    ```toml
    [mcp_servers.openaiDeveloperDocs]
    url = "https://developers.openai.com/mcp"
    ```

同时指向: https://developers.openai.com/resources/docs-mcp#quickstart

---

## 7. pr-draft-summary (PR 草稿摘要)

**名称**: pr-draft-summary
**描述**: 在实质性代码变更完成后创建 PR 标题和草稿描述。在完成中等或更大变更（运行时代码、测试、构建配置、有行为影响的文档）并需要包含变更摘要的 PR 准备摘要块时触发。

### 目的

在此仓库完成实质性代码工作后生成所需的 PR 就绪摘要：简洁的摘要加上 PR 就绪的标题和以 "This pull request <verb> ..." 开头的草稿描述。该块应准备好粘贴到 openai-agents-python 的 PR 中。

### 何时触发

- 此仓库的任务已完成（或准备好审查），并且涉及运行时代码、测试、示例、有行为影响的文档或构建/测试配置
- 你即将发送"工作完成"响应并需要包含 PR 块
- 仅跳过微不足道或仅对话的任务，这些任务不需要 PR 风格的摘要

### 自动收集的输入（不要询问用户）

- 当前分支: `git rev-parse --abbrev-ref HEAD`
- 工作树: `git status -sb`
- 未跟踪文件: `git ls-files --others --exclude-standard`（与 `git status -sb` 一起使用以确保它们被显示；`--stat` 不包含它们）
- 变更文件: `git diff --name-only`（未暂存）和 `git diff --name-only --cached`（已暂存）；大小通过 `git diff --stat` 和 `git diff --stat --cached`
- 最新发布标签（优先远程感知查找）: `LATEST_RELEASE_TAG=$(.agents/skills/final-release-review/scripts/find_latest_release_tag.sh origin 'v*' 2>/dev/null || git tag -l 'v*' --sort=-v:refname | head -n1)`
- 基础引用（使用分支的上游，回退到 `origin/main`）:
  - `BASE_REF=$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || echo origin/main)`
  - `BASE_COMMIT=$(git merge-base --fork-point "$BASE_REF" HEAD || git merge-base "$BASE_REF" HEAD || echo "$BASE_REF")`
- 领先于基础分叉点的提交: `git log --oneline --no-merges ${BASE_COMMIT}..HEAD`
- 此仓库的类别信号: 运行时代码（`src/agents/`）、测试（`tests/`）、示例（`examples/`）、文档（`docs/`、`mkdocs.yml`）、构建/测试配置（`pyproject.toml`、`uv.lock`、`Makefile`、`.github/`）

### 工作流程

1. 运行上述命令而不询问用户；首先计算 `BASE_REF`/`BASE_COMMIT` 以便后续命令重用它们
2. 如果没有已暂存/未暂存/未跟踪的变更且没有领先于 `${BASE_COMMIT}` 的提交，简要回复未检测到代码变更并跳过发出 PR 块
3. 根据"类别信号"下列出的路径推断变更类型；分类为功能、修复、重构或有影响的文档，仅当差异更改了发布的公共 API、外部配置、持久化数据、序列化状态或 wire 协议时标记向后兼容性风险。根据 `LATEST_RELEASE_TAG` 判断该风险，而不是未发布的分支独有变动
4. 使用关键路径（前 5 个）和 `git diff --stat` 输出用 1-3 句简短摘要总结变更；明确指出来自 `git status -sb`/`git ls-files --others --exclude-standard` 的未跟踪文件，因为 `--stat` 不包含它们。如果工作树干净但有领先于 `${BASE_COMMIT}` 的提交，使用那些提交消息总结
5. 为描述选择主要动词: 功能 → `adds`，bug 修复 → `fixes`，重构/性能 → `improves` 或 `updates`，仅文档 → `updates`
6. 建议分支名称。如果已经偏离 main，保留它；否则根据主要区域建议 `feat/<slug>`、`fix/<slug>` 或 `docs/<slug>`（例如 `docs/pr-draft-summary-guidance`）
7. 如果当前分支匹配 `issue-<number>`（仅数字），保留该分支建议。可选地在可用时获取轻量级问题上下文（例如通过 GitHub API），但在不可用时不要阻塞或重试。当存在问题时，引用 `https://github.com/openai/openai-agents-python/issues/<number>` 并包含自动关闭行，例如 `This pull request resolves #<number>.`
8. 使用下方模板起草 PR 标题和描述
9. 仅输出"输出格式"中的块。周围的状态说明保持最小化且为英文

### 输出格式

关闭任务且需要摘要块时在任何简短状态说明后添加此简洁 Markdown 块（仅英文）。如果用户说不需要，跳过此部分。

```
# Pull Request Draft

## Branch name suggestion

git checkout -b <kebab-case suggestion, e.g., feat/pr-draft-summary-skill>

## Title

<single-line imperative title, which can be a commit message; if a common prefix like chore: and feat: etc., having them is preferred>

## Description

<include what you changed plus a draft pull request title and description for your local changes; start the description with prose such as "This pull request resolves/updates/adds ..." using a verb that matches the change (you can use bullets later), explain the change background (for bugs, clearly describe the bug, symptoms, or repro; for features, what is needed and why), any behavior changes or considerations to be aware of, and you do not need to mention tests you ran.>
```

保持简洁——块周围没有冗余的散文，避免在 `Changes` 和描述之间重复细节。除非特别要求，否则不需要列出测试。

---

## 8. test-coverage-improver (测试覆盖率改进)

**名称**: test-coverage-improver
**描述**: 改进 OpenAI Agents Python 仓库中的测试覆盖率：运行 `make coverage`，检查覆盖率工件，识别低覆盖率文件，提出高影响力测试，并在写测试前与用户确认。

### 概述

每当需要评估或改进覆盖率时使用此技能（覆盖率回归、失败阈值或用户要求更强的测试）。它运行覆盖率套件，分析结果，突出最大差距，并在确认用户后再更改代码的情况下准备测试添加。

### 快速开始

1. 从仓库根目录运行 `make coverage` 以重新生成 `.coverage` 数据和 `coverage.xml`
2. 收集工件：`.coverage` 和 `coverage.xml`，以及 `coverage report -m` 的控制台输出用于深入分析
3. 总结覆盖率：总百分比、最低文件和未覆盖的行/路径
4. 为每个文件起草测试想法：场景、被测试的行为、预期结果和可能的覆盖率提升
5. 询问用户批准实施提议的测试；暂停直到他们同意
6. 获批后，在 `tests/` 中编写测试，重新运行 `make coverage`，然后在标记工作完成前运行 `$code-change-verification`

### 工作流程详情

- **运行覆盖率**: 在仓库根目录执行 `make coverage`。避免 watch 标志，仅在比较趋势时保留先前的覆盖率工件
- **高效解析摘要**:
  - 优先使用 `coverage report -m` 的控制台输出获取文件级总计；回退到 `coverage.xml` 用于工具或电子表格
  - 如果需要交互式深入分析，使用 `uv run coverage html` 生成 `htmlcov/index.html`
- **优先目标**:
  - `src/` 中的公共 API 或共享工具优先于示例或文档
  - 低语句覆盖率或新增 0% 的文件
  - 最近的 bug 修复或风险代码路径（错误处理、重试、超时、并发）
- **设计有影响力的测试**:
  - 覆盖未覆盖的路径：错误情况、边界输入、可选标志和取消/超时
  - 覆盖组合逻辑而不是简单的成功路径
  - 测试放在 `tests/` 下，避免 flaky 的异步计时
- **与用户协调**: 呈现提议测试添加的编号简洁列表和预期的覆盖率提升。在编辑代码或 fixtures 之前明确询问
- **实施后**: 重新运行覆盖率，报告更新的摘要，并注意任何仍处于低覆盖率的领域

### 注意

- 保持任何添加的注释或代码为英文
- 除非以后需要，否则不要创建 `scripts/`、`references/` 或 `assets/`
- 如果覆盖率工件缺失或过时，重新运行 `pnpm test:coverage` 而不是猜测

---

## 总结

| 技能名称 | 功能描述 |
|---------|---------|
| code-change-verification | 代码格式、linting、类型检查、测试验证 |
| docs-sync | 文档覆盖率审计、同步和结构改进 |
| examples-auto-run | 自动运行 Python 示例并管理日志 |
| final-release-review | 发布就绪性审查和风险评估 |
| implementation-strategy | 实现策略和兼容性边界决策 |
| openai-knowledge | OpenAI 官方文档查询 |
| pr-draft-summary | PR 标题和草稿描述生成 |
| test-coverage-improver | 测试覆盖率分析和改进 |
