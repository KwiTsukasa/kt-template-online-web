# KT Template Online Web

`kt-template-online-web` 是 KT Template Online 的前台入口，负责展示组件/图表模板列表、按字典分类筛选、搜索、删除、复制分享链接，并跳转到 Playground 进行新增或编辑。

## 技术栈

- Vue 3 + TypeScript
- Vite
- Vue Router + Pinia
- Ant Design Vue
- UnoCSS + Sass
- Axios
- pnpm

## 功能概览

- 首页展示组件模板卡片列表。
- 通过 `COMPONENT_TYPE` 和二级字典筛选组件。
- 支持按名称搜索、分页、删除组件。
- 点击组件进入 Playground 编辑。
- 新增按钮根据当前分类生成 Playground 新建链接。
- 分享按钮复制带 query 和 hash 的 Playground 链接。

## 目录结构

```text
src
  api/                 # axios 封装和业务接口
  components/logo/     # Logo
  hooks/               # 主题、模型等组合逻辑
  modules/chartList/   # 组件列表和分类筛选
  modules/header/      # 顶部栏、搜索、主题切换
  modules/theme/       # 主题组件
  utils/               # 环境检测、转换工具
  views/home.vue       # 首页
  App.vue              # 应用布局
  config.ts            # 前端运行配置
  router.ts            # 路由
```

## 环境变量

仓库只提交 `.env.example`，真实 `.env.development` 和 `.env.production` 保留在本地。

```env
NODE_ENV=development
VITE_APP_PLAY_GROUND=http://localhost:48090
VITE_APP_PROXY=http://localhost:48085/
VITE_APP_ADMIN_LOGIN=http://localhost:5999/auth/login
VITE_APP_BASE_API=/api
VITE_APP_OSS_DOMAIN=/chart-assets
```

关键变量：

| 变量 | 说明 |
| --- | --- |
| `VITE_APP_PLAY_GROUND` | Playground 地址，用于新增、编辑和分享链接 |
| `VITE_APP_PROXY` | 后端服务地址，Vite dev server 会把 `/api` 代理到这里 |
| `VITE_APP_ADMIN_LOGIN` | 后台登录页地址，组件接口 `401` 时会带 `redirect` 跳转到这里 |
| `VITE_APP_BASE_API` | API 前缀，当前代码使用 `/api` |
| `VITE_APP_OSS_DOMAIN` | 静态资源域名预留配置 |

## 启动

```bash
pnpm install
pnpm dev
```

开发服务默认端口为 `48089`。

常用命令：

```bash
pnpm dev       # 本地开发
pnpm build     # 类型检查并构建
pnpm preview   # 预览构建产物
pnpm deploy    # 构建并执行部署脚本
```

## 接口约定

接口集中在 `src/api`：

- `request.ts`：axios 实例，`baseURL` 来自 `src/config.ts`。
- `auth.ts`：复用后台登录态，持久化 `accessToken`、用户信息和权限码，支持通过刷新 token cookie 自动续期。
- `component.ts`：组件列表、详情、删除。
- `dict.ts`：一级/二级字典查询。

当前主要接口：

| 方法 | 地址 | 用途 |
| --- | --- | --- |
| `GET` | `/component/list` | 分页查询组件 |
| `GET` | `/component/detail` | 查询组件详情和模板内容 |
| `POST` | `/component/remove` | 逻辑删除组件 |
| `GET` | `/dict/getDictByKey` | 查询一级字典 |
| `GET` | `/dict/getComponentDictByType` | 根据一级类型查询二级类型 |

组件接口需要后台登录态。请求层会先读取本地持久化的 accessToken；没有 token 时会通过 `/auth/refresh` 使用 cookie 刷新并持久化登录数据；接口返回 `401` 时会跳到 `VITE_APP_ADMIN_LOGIN`，登录成功后回到原页面。

## Playground 跳转

`ChartList.vue` 负责构造 Playground 链接：

- `query` 保存组件元信息：`id`、`name`、`type`、`componentType`。
- `hash` 保存组件模板序列化内容。
- Playground 编辑器会继续保留 query，并把编辑器状态写回 hash。

示例：

```text
http://localhost:48090/?id=xxx&name=基础折线图&type=1&componentType=1#...
```

## 开发约定

- 新增接口先放到 `src/api`，页面组件不直接写 axios URL。
- Ant Design Vue 组件绑定沿用当前写法，例如 `v-model:value`。
- 列表页保持工具型界面：卡片列表区域撑满，分页固定在底部。
- 删除和分享等操作要保持已有消息反馈。

## 轻量验证

常规前端改动优先执行：

```bash
pnpm exec vue-tsc --noEmit
```

涉及页面交互时再启动开发服务看明显报错：

```bash
pnpm dev
```
