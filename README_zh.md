# ICPC 图论工具

一个用于竞赛编程练习的交互式图可视化工具。基于 React、TypeScript 和 React Flow 构建。

[English](./README.md) | 简体中文

## 功能特性

### 图生成
- **随机图** - 基于 Erdos-Renyi 模型，可配置节点数量和边概率
- **随机树** - 使用 Prufer 序列生成均匀随机树
- **特殊图** - 星形图、完全图、链状图和网格图
- **力导向布局** - 基于物理模拟的自动节点定位
- **手动输入** - 灵活的节点/边格式支持自定义图

### 图配置
- 切换**有向图**和**无向图**
- 切换**带权图**和**无权图**
- 可配置随机图的边概率
- **内联权重编辑** - 双击边标签即可编辑权重

### 图算法
- **最短路径** - Dijkstra（带权）或 BFS（无权）
- **强连通分量 (SCC)** - Kosaraju 算法
- **DAG 布局** - 拓扑排序与层级可视化
- **最近公共祖先 (LCA)** - 倍增算法

### 交互式画布
- 双击画布添加节点
- 右键删除节点/边
- 从节点边缘拖拽创建连接
- Ctrl+点击多选节点
- 平移和缩放控制
- 小地图导航

### 可视化反馈
- 最短路径高亮显示（蓝色）
- SCC 使用 8 种不同颜色区分
- LCA 高亮显示（红色）
- 实时显示节点/边数量和算法结果

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/cp-graph.git
cd cp-graph

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

### 构建

```bash
# 生产环境构建
npm run build

# 预览生产构建
npm run preview
```

### 代码检查

```bash
# 运行 ESLint
npm run lint
```

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具和开发服务器
- **React Flow** - 图可视化库
- **Zustand** - 状态管理
- **Tailwind CSS** - 样式

## 项目结构

```
src/
├── algorithms/           # 图算法
│   ├── graphGenerator/   # 随机图、树、特殊图、力导向布局
│   ├── lca/              # 倍增 LCA
│   ├── scc/              # Kosaraju SCC
│   ├── shortestPath/     # Dijkstra 和 BFS
│   └── topoSort/         # DAG 拓扑排序
├── components/
│   ├── canvas/           # GraphCanvas, CustomNode, CustomEdge
│   └── ui/               # Toolbar, InfoPanel
├── constants/            # 图常量（颜色、大小）
├── store/                # Zustand 状态管理
├── types/                # TypeScript 类型定义
└── utils/                # 工具函数
```

## 架构设计

### 状态管理
应用使用集中的 Zustand store (`src/store/graphStore.ts`) 管理：
- 节点和边
- 图配置（有向/带权）
- 选中的节点
- 算法结果
- 基于计数器的 ID 生成

### 类型系统
- `GraphNode` 扩展 React Flow 的 `Node`，添加自定义数据属性
- `GraphEdge` 扩展 React Flow 的 `Edge`，添加可选权重
- 每个算法都有类型化的结果对象

### 算法模式
所有算法遵循函数式模式：
- 输入：`GraphNode[]` 和 `GraphEdge[]`
- 输出：类型化的结果对象
- 每个分类通过 `index.ts` 进行清晰的导出

## 使用技巧

1. **添加节点**：在画布任意位置双击
2. **创建边**：从节点边缘拖拽到另一个节点
3. **删除**：右键点击任意节点或边
4. **多选**：按住 Ctrl 并点击以选择多个节点
5. **编辑权重**：双击边标签（需启用带权模式）
6. **运行算法**：先选择源/目标节点，然后点击算法按钮

## 参与贡献

欢迎贡献代码！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 许可证

本项目基于 Apache License 2.0 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。
