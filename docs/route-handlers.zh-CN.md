# 路由处理程序（Route Handlers）

> 原文：https://nextjs.org/docs/app/getting-started/route-handlers
>
> 版本：16.3.4 ｜ 最后更新：2026-03-03

路由处理程序允许你使用 Web 标准的 [Request](https://developer.mozilla.org/docs/Web/API/Request) 和 [Response](https://developer.mozilla.org/docs/Web/API/Response) API，为给定路由创建自定义的请求处理程序。

![Route.js 特殊文件](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/route-special-file.png)

> **须知**：路由处理程序仅在 `app` 目录中可用。它们相当于 `pages` 目录中的 [API 路由](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)，也就是说你**不需要**同时使用 API 路由和路由处理程序。

## 约定（Convention）

路由处理程序定义在 `app` 目录内的 [`route.js|ts` 文件](https://nextjs.org/docs/app/api-reference/file-conventions/route)中：

```ts filename="app/api/route.ts" switcher
export async function GET(request: Request) {}
```

```js filename="app/api/route.js" switcher
export async function GET(request) {}
```

路由处理程序可以像 `page.js` 和 `layout.js` 一样嵌套在 `app` 目录的任何位置。但是，在**同一个**路由段层级中，`route.js` 文件**不能**与 `page.js` 文件共存。

## 支持的 HTTP 方法

支持以下 [HTTP 方法](https://developer.mozilla.org/docs/Web/HTTP/Methods)：`GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD` 和 `OPTIONS`。如果调用了不受支持的方法，Next.js 将返回 `405 Method Not Allowed` 响应。

## 扩展的 `NextRequest` 和 `NextResponse` API

除了支持原生的 [Request](https://developer.mozilla.org/docs/Web/API/Request) 和 [Response](https://developer.mozilla.org/docs/Web/API/Response) API 之外，Next.js 还通过 [`NextRequest`](https://nextjs.org/docs/app/api-reference/functions/next-request) 和 [`NextResponse`](https://nextjs.org/docs/app/api-reference/functions/next-response) 对它们进行了扩展，为高级用例提供了便捷的辅助功能。

```ts
export async function GET(request: NextRequest, context: RouteContext) { ... }
```



## 缓存（Caching）

路由处理程序默认不被缓存。不过，你可以为 `GET` 方法选择启用缓存。其他受支持的 HTTP 方法**不会**被缓存。要缓存 `GET` 方法，可以在路由处理程序文件中使用[路由配置选项](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic)，例如 `export const dynamic = 'force-static'`。

```ts filename="app/items/route.ts" switcher
export const dynamic = 'force-static'

export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json()

  return Response.json({ data })
}
```

```js filename="app/items/route.js" switcher
export const dynamic = 'force-static'

export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json()

  return Response.json({ data })
}
```

> **须知**：其他受支持的 HTTP 方法**不会**被缓存，即使它们与被缓存的 `GET` 方法放在同一个文件中也是如此。

### 使用 Cache Components（缓存组件）

当启用 [Cache Components](https://nextjs.org/docs/app/getting-started/caching) 时，`GET` 路由处理程序遵循与应用中普通 UI 路由相同的模型。它们默认在请求时运行；当它们不访问未缓存数据或运行时数据时可以被预渲染；你还可以使用 `use cache` 将未缓存的数据纳入静态响应中。

**静态示例** - 不访问未缓存数据或运行时数据，因此会在构建时被预渲染：

```tsx filename="app/api/project-info/route.ts"
export async function GET() {
  return Response.json({
    projectName: 'Next.js',
  })
}
```

**动态示例** - 访问了非确定性操作。在构建期间，当调用 `Math.random()` 时预渲染会停止，并推迟到请求时渲染：

```tsx filename="app/api/random-number/route.ts"
export async function GET() {
  return Response.json({
    randomNumber: Math.random(),
  })
}
```

**运行时数据示例** - 访问了与请求相关的数据。当调用 `headers()` 等运行时 API 时，预渲染会终止：

```tsx filename="app/api/user-agent/route.ts"
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')

  return Response.json({ userAgent })
}
```

> **须知**：如果 `GET` 处理程序访问了网络请求、数据库查询、异步文件系统操作、请求对象属性（如 `req.url`、`request.headers`、`request.cookies`、`request.body`）、[`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies)、[`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers)、[`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection) 等运行时 API，或非确定性操作，预渲染将会停止。

**缓存示例** - 访问了未缓存的数据（数据库查询），但使用 `use cache` 对其进行缓存，使其可以被包含在预渲染的响应中：

```tsx filename="app/api/products/route.ts"
import { cacheLife } from 'next/cache'

export async function GET() {
  const products = await getProducts()
  return Response.json(products)
}

async function getProducts() {
  'use cache'
  cacheLife('hours')

  return await db.query('SELECT * FROM products')
}
```

> **须知**：`use cache` 不能直接在路由处理程序函数体内使用；需要将其提取到辅助函数中。当有新请求到达时，缓存的响应会根据 `cacheLife` 进行重新验证（revalidate）。

## 路由解析（Route Resolution）

你可以将 `route` 视为最低级别的路由原语。

* 它们**不**像 `page` 那样参与布局（layouts）或客户端导航。
* 在**同一个**路由下，`route.js` 文件**不能**与 `page.js` 文件共存。

| Page（页面）          | Route（路由）       | 结果                        |
| -------------------- | ------------------ | --------------------------- |
| `app/page.js`        | `app/route.js`     | ✗ 冲突                      |
| `app/page.js`        | `app/api/route.js` | ✓ 有效                      |
| `app/[user]/page.js` | `app/api/route.js` | ✓ 有效                      |

每个 `route.js` 或 `page.js` 文件会接管该路由的所有 HTTP 动词（verbs）。

```ts filename="app/page.ts" switcher
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}

// 冲突
// `app/route.ts`
export async function POST(request: Request) {}
```

```js filename="app/page.js" switcher
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}

// 冲突
// `app/route.js`
export async function POST(request) {}
```

进一步了解路由处理程序如何[为你的前端应用提供补充](https://nextjs.org/docs/app/guides/backend-for-frontend)，或查看路由处理程序的 [API 参考](https://nextjs.org/docs/app/api-reference/file-conventions/route)。

## 路由上下文辅助类型（Route Context Helper）

在 TypeScript 中，你可以使用全局可用的 [`RouteContext`](https://nextjs.org/docs/app/api-reference/file-conventions/route#route-context-helper) 辅助类型为路由处理程序的 `context` 参数添加类型：

```ts filename="app/users/[id]/route.ts" switcher
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
  return Response.json({ id })
}
```

RouteContext是为TS提供类型提示。需要你传入当前文件的路由地址。NextJS是知道路由地址的，但是TS并不知道。

`params` (核心属性)

**作用**：一个包含当前动态路由参数（Dynamic Segments）的对象 Promise。



## 获取参数

### params

`params` 用于获取动态路由段（Dynamic Segments）。它是一个 Promise，需要使用 `await` 解析。假设文件路径为 `app/users/[id]/route.ts`，请求 `/users/123` 时：

```ts filename="app/users/[id]/route.ts" switcher
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/users/[id]'>
) {
  const { id } = await ctx.params
  return Response.json({ id }) // { "id": "123" }
}
```

对于多个动态段，例如 `app/posts/[slug]/comments/[id]/route.ts`：

```ts filename="app/posts/[slug]/comments/[id]/route.ts"
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/posts/[slug]/comments/[id]'>
) {
  const { slug, id } = await ctx.params
  return Response.json({ slug, id })
}
```

### query

查询参数（Query Parameters）即 URL 中 `?` 之后的部分，可以通过 `NextRequest` 的 `nextUrl.searchParams` 获取。例如请求 `/search?q=next&page=2`：

```ts filename="app/search/route.ts" switcher
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const query = searchParams.get('q') // "next"
  const page = searchParams.get('page') // "2"

  return Response.json({ query, page })
}
```

常用方法：`get(name)` 返回第一个匹配值（不存在时返回 `null`）；`getAll(name)` 返回所有匹配值；`has(name)` 判断参数是否存在。

### formData

表单数据需要读取请求体。对于 `POST` 请求，可以使用 Web 标准的 `request.formData()`：

```ts filename="app/users/route.ts" switcher
export async function POST(request: Request) {
  const formData = await request.formData()

  const name = formData.get('name') as string
  const file = formData.get('file') as File

  return Response.json({
    name,
    fileName: file?.name,
    fileSize: file?.size,
  })
}
```

### json

如果请求体是 JSON，则使用 `request.json()`：

```ts filename="app/users/route.ts"
export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({ name: body.name })
}
```

> **须知**：请求体的读取方法（如 `json()`、`formData()`、`text()`）只能调用一次；重复调用会抛出 `TypeError`。如需多次读取，可先调用 `request.clone()`。



