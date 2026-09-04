# 缓存（Caching）

> 原文：https://nextjs.org/docs/app/getting-started/caching
>
> 版本：16.3.4 ｜ 最后更新：2026-08-25

> **须知**：本页介绍的是通过在 `next.config.ts` 文件中设置 [`cacheComponents: true`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) 来启用的 [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) 缓存方案。如果你没有使用 Cache Components，请参阅[缓存与重新验证（旧模型）](https://nextjs.org/docs/app/guides/caching-without-cache-components)指南。

缓存是一种存储数据获取及其他计算结果的技术，这样后续对相同数据的请求就可以更快地被满足，而无需重复执行同样的工作。

## 启用 Cache Components

你可以在 Next 配置文件中添加 [`cacheComponents`](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) 选项来启用 Cache Components：

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

```js filename="next.config.js" switcher
/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
}

module.exports = nextConfig
```

> **须知**：启用 Cache Components 后，`GET` 路由处理程序将遵循与页面相同的预渲染模型。详情参见[使用 Cache Components 的路由处理程序](https://nextjs.org/docs/app/getting-started/route-handlers#with-cache-components)。

## 用法（Usage）

[`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) 指令用于缓存异步函数和组件的返回值。你可以在两个层级上应用它：

* **数据层级**：缓存一个获取或计算数据的函数（例如 `getProducts()`、`getUser(id)`）
* **UI 层级**：缓存整个组件或页面（例如 `async function BlogPosts()`）

缓存指令会为结果赋予一个生命周期（lifetime），Next.js 利用这一信息来应用渲染优化。关于缓存结果如何成为静态外壳（static shell）的一部分、并可能被包含在[预取（prefetch）](#预取prefetching)中，请参见[预渲染](#预渲染prerendering)。

> **须知**：我们建议每一条缓存指令都搭配一个 [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) 使用。如果没有指定，则会应用隐式的 `default` 配置。

参数以及从父作用域捕获的任何值会自动成为[缓存键（cache key）](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-keys)的一部分，这意味着不同的输入会产生各自独立的缓存条目。关于缓存条目中保存了什么，请参见[缓存输出](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-output)；关于哪些内容可以被缓存以及参数的工作方式，请参见[序列化要求与约束](https://nextjs.org/docs/app/api-reference/directives/use-cache#constraints)。

### 数据层级缓存

要缓存一个获取数据的异步函数，可以在函数体的顶部添加 `use cache` 指令：

```tsx filename="app/lib/data.ts" highlight={1,4,5}
import { cacheLife } from 'next/cache'

export async function getUsers() {
  'use cache'
  cacheLife('hours')
  return db.query('SELECT * FROM users')
}
```

当同一份数据被多个组件使用，或者你希望将数据与 UI 分开独立缓存时，数据层级缓存会非常有用。

### UI 层级缓存

要缓存整个组件、页面或布局，可以在组件或页面的顶部添加 `use cache` 指令：

```tsx filename="app/page.tsx" highlight={1,4,5}
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('hours')

  const users = await db.query('SELECT * FROM users')

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

> 如果你在文件顶部添加 `use cache`，该文件中所有导出的函数都会被缓存。

### 流式传输未缓存的数据

对于从异步数据源（如 API、数据库或任何其他异步操作）获取数据、并且**每次请求都需要最新数据**的组件，请不要使用 `use cache`。

相反，应将组件包裹在 [`<Suspense>`](https://react.dev/reference/react/Suspense) 中并提供一个回退 UI（fallback）。回退 UI 会随预渲染的静态外壳一起发送，而异步工作则在请求时执行。

```tsx filename="page.tsx"
import { Suspense } from 'react'

async function LatestPosts() {
  const data = await fetch('https://api.example.com/posts')
  const posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <>
      <h1>My Blog</h1>
      <Suspense fallback={<p>Loading posts...</p>}>
        <LatestPosts />
      </Suspense>
    </>
  )
}
```

例如，`<p>Loading posts...</p>` 会被包含在静态外壳中，而文章内容则在请求时流式传入。

如果未缓存的读取操作周围没有 `<Suspense>` 边界，开发者工具浮层（dev overlay）会显示 **blocking-route** 洞察提示及对应的修复方案：

> **须知**：每张修复卡片都链接到一份详细的操作指南，其中包含模式、代码示例和权衡分析。点击卡片即可深入了解。

`<Suspense>` 会在异步工作完成期间提供回退 UI，但它本身并不会让组件进入动态渲染。如果组件只执行同步工作，那么无论它是否被包裹在 `<Suspense>` 中，它都会在预渲染期间完成。

## 与运行时 API 协作

运行时 API（Runtime APIs）需要只有在用户发起请求时才可用的信息。这些 API 包括：

* [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) - 用户的 Cookie 数据
* [`headers`](https://nextjs.org/docs/app/api-reference/functions/headers) - 请求头
* [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional) - URL 查询参数
* [`params`](https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional) - 动态路由参数。你可以使用 [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) 在构建时预渲染特定值，或使用 [ISR 与 Cache Components](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components) 在未知参数于后台解析期间先提供[应用外壳（App Shell）](https://nextjs.org/docs/app/glossary#app-shell)。

访问运行时 API 的组件应当被包裹在 `<Suspense>` 中：

```tsx filename="page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'

async function UserGreeting() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'light'
  return <p>Your theme: {theme}</p>
}

export default function Page() {
  return (
    <>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <UserGreeting />
      </Suspense>
    </>
  )
}
```

在没有 `<Suspense>` 的情况下访问运行时 API，同样会在开发者工具浮层中显示 **blocking-route** 洞察提示，并给出相同的修复方案：

依赖运行时的数据仍然可以通过 [`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private) 获得缓存生命周期——这是随 Cache Components 一起提供的另一个变体。它为直接读取 `cookies`、`headers` 或 `searchParams` 的函数赋予生命周期，从而使其结果可以被包含在[预取](#预取prefetching)中。

下一节展示了 `use cache: private` 的一种替代方案：提取运行时值并将其传递给共享的缓存函数。

### 将运行时值传递给缓存函数

你可以从运行时 API 中提取值，并将其作为参数传递给缓存函数：

```tsx filename="app/profile/page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

// 组件（未缓存）读取运行时数据
async function ProfileContent() {
  const session = (await cookies()).get('session')?.value
  return <CachedContent sessionId={session} />
}

// 缓存组件接收提取出的值作为 prop
async function CachedContent({ sessionId }: { sessionId: string }) {
  'use cache'
  // sessionId 会成为缓存键的一部分
  const data = await fetchUserData(sessionId)
  return <div>{data}</div>
}
```

在请求时，如果找不到匹配的缓存条目，`<CachedContent />` 就会执行，并将结果存储起来供未来具有相同 `sessionId` 的请求使用。

> **须知**：由于 `<CachedContent />` 被请求数据所门控（gated），它不会被加入预渲染的静态外壳。在运行时，它默认被缓存在[内存](https://nextjs.org/docs/app/api-reference/directives/use-cache#runtime-caching-considerations)中，这在 serverless 环境下无法跨请求持久保存，因此可能会在每次请求时重新求值。如需持久且共享的缓存，请使用 [`use cache: remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote)。

采用这种模式后，[预取](#预取prefetching)可以在客户端导航转换期间使用用户的真实会话预渲染 `<CachedContent />`，让结果在点击之前就已就绪。即使服务端条目很少能在请求之间存活，这依然有效——因为你赋予的生命周期正是让结果得以加入预取的关键，客户端会将该结果视为在其 [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) `stale` 窗口内是新鲜的。

## 静态、缓存与流式传输

下面是一个完整的示例，展示了静态内容、缓存的动态内容以及流式传输的动态内容如何在同一个页面上协同工作：

```tsx filename="app/blog/page.tsx"
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'

export default function BlogPage() {
  return (
    <>
      {/* 静态内容 - 自动预渲染 */}
      <header>
        <h1>Our Blog</h1>
        <nav>
          <Link href="/">Home</Link> | <Link href="/about">About</Link>
        </nav>
      </header>

      {/* 缓存的动态内容 - 包含在静态外壳中 */}
      <BlogPosts />

      {/* 运行时动态内容 - 在请求时流式传输 */}
      <Suspense fallback={<p>Loading your preferences...</p>}>
        <UserPreferences />
      </Suspense>
    </>
  )
}

type Post = { id: string; title: string; author: string; date: string }

// 所有人看到的博客文章都相同（每小时重新验证一次）
async function BlogPosts() {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')

  const res = await fetch('https://api.vercel.app/blog')
  const posts: Post[] = await res.json()

  return (
    <section>
      <h2>Latest Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>
              By {post.author} on {post.date}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// 依赖存储在 cookie 中的值的 UI
async function UserPreferences() {
  const theme = (await cookies()).get('theme')?.value || 'light'
  const favoriteCategory = (await cookies()).get('category')?.value

  return (
    <aside>
      <p>Your theme: {theme}</p>
      {favoriteCategory && <p>Favorite category: {favoriteCategory}</p>}
    </aside>
  )
}
```

在预渲染期间，页头（静态）和博客文章（通过 `use cache` 缓存）会成为静态外壳的一部分，用户偏好设置的回退 UI 也会一并包含。依赖 cookie 的偏好 UI 则在请求时流式传入。

在这里读取 `cookies()` 并不会像之前的渲染模型那样把整个路由变为动态渲染。Suspense 边界为运行时访问的流式传输提供了回退 UI，而静态和缓存的内容仍然会随初始 HTML 一起发送。

正如 `<Suspense>` 包裹异步访问一样，**错误边界（error boundary）**用于包容失败：将它们包裹在渲染期间可能出错的子树周围。组件级别的边界可以使用 [`catchError`](https://nextjs.org/docs/app/api-reference/functions/catchError)，路由级别的边界则可以使用 [`error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error) 文件约定。

在构建应用时请注意：在 [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#with-cache-components) 和 [`generateViewport`](https://nextjs.org/docs/app/api-reference/functions/generate-viewport#with-cache-components) 内部，未缓存的 fetch 或运行时数据访问会与页面中一样触发相同的洞察和错误，引导你实现预期的渲染方式。关于同时包含已知与未知参数值的增量静态再生，请参见 [ISR 与 Cache Components](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components)。

## 随机值与时间戳

像 `Math.random()`、`Date.now()` 或 `crypto.randomUUID()` 这样的操作，每次执行都会产生不同的值。Cache Components 要求你显式地处理这些情况。

> **须知**：`performance.now()` 是用于遥测（telemetry）的，因此 Next.js 不会将它视为需要防护的值。你可以用它进行计时，并把结果传递给你的日志或指标系统，而不是直接渲染它。

**要为每次请求生成唯一的值**，可以推迟到请求时执行：在这些操作之前调用 [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection)，并将组件包裹在 `<Suspense>` 中：

```tsx filename="page.tsx" highlight={1,4-6}
import { connection } from 'next/server'
import { Suspense } from 'react'

async function UniqueContent() {
  await connection()
  const uuid = crypto.randomUUID()
  return <p>Request ID: {uuid}</p>
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UniqueContent />
    </Suspense>
  )
}
```

或者，你也可以**缓存结果**，这样所有用户都会看到同一个值，直到重新验证为止：

```tsx filename="page.tsx"
export default async function Page() {
  'use cache'
  const buildId = crypto.randomUUID()
  return <p>Build ID: {buildId}</p>
}
```

你无需记住哪些操作会有这种行为。开发者工具浮层会显示 **blocking-prerender-random**、**blocking-prerender-current-time** 或 **blocking-prerender-crypto** 洞察提示（取决于具体的调用），并提供上述修复方案。

## 可预测的值

与随机值和时间戳不同（它们在每次渲染之间可能不同），模块导入、同步 I/O 以及纯计算每次运行都会产生相同的结果。只使用这些操作的组件会被自动预渲染，其输出在构建时成为静态 HTML 的一部分。

```tsx filename="page.tsx"
import fs from 'node:fs'

export default async function Page() {
  const constants = await import('./constants.json')
  const content = fs.readFileSync('./config.json', 'utf-8')
  const items = JSON.parse(content).items ?? []

  return (
    <div>
      <h1>{constants.appName}</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.value}</li>
        ))}
      </ul>
    </div>
  )
}
```

> **须知**：这也包括使用同步 API 的嵌入式数据库查询，例如 `better-sqlite3` 或 Node.js 内置的 [`node:sqlite`](https://nodejs.org/api/sqlite.html)。如果你需要来自同步数据源的每请求数据，请在查询之前调用 [`connection()`](https://nextjs.org/docs/app/api-reference/functions/connection)。

一些异步 API 读取的本地资源并不依赖于传入的请求，例如字体或配置文件。当这些资源预期对每个请求都相同时，应该在模块作用域中读取一次，而不是在渲染期间读取。

如果数据应该在渲染期间计算并在多个请求之间复用，可以将读取操作包裹在 [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache) 中。如果数据依赖于传入的请求或预期会随时间变化，则应在请求时渲染期间读取。

```tsx filename="page.tsx"
import { readFile } from 'node:fs/promises'

const content = await readFile('./config.json', 'utf-8')
const items = JSON.parse(content).items ?? []

export default function Page() {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.value}</li>
      ))}
    </ul>
  )
}
```

在这个示例中，配置文件预期对每个请求都相同，因此它在模块作用域中读取一次。如果在组件内部调用 `await readFile()`，它将被视为未缓存的数据，必须要么在 `use cache` 中访问，要么放在 `<Suspense>` 边界之后。由于该文件不依赖请求且预期不会变化，模块作用域是最简单的选择。

## 预渲染（Prerendering）

在构建时，Next.js 会渲染你路由的组件树。每个组件如何被处理取决于它使用的 API：

* [`use cache`](#用法usage)：只要其生命周期[不是太短](https://nextjs.org/docs/app/api-reference/functions/cacheLife#prerendering-behavior)，结果就会被缓存并包含在静态外壳中
* [`<Suspense>`](#流式传输未缓存的数据)：回退 UI 会被包含在静态外壳中，而内容则在请求时流式传入
* [可预测的值](#可预测的值)：模块导入、`fs.readFileSync` 和纯计算会在预渲染期间完成，并自动包含在静态外壳中
* [随机值与时间戳](#随机值与时间戳)：使用 `connection()` + `<Suspense>` 可为每次请求获取唯一值，或使用 `use cache` 在所有用户之间共享同一个值

这会生成一个静态外壳，其中包含用于首次页面加载的 HTML 和用于客户端导航的序列化 [RSC Payload](https://nextjs.org/docs/app/getting-started/server-and-client-components#on-the-server)，从而确保无论用户是直接访问该 URL 还是从其他页面跳转过来，浏览器都能立即收到完整渲染的内容。这种渲染方式被称为**部分预渲染（Partial Prerendering，PPR）**，是启用 Cache Components 后的默认行为。

![部分预渲染的产品页面，展示静态的导航栏和产品信息，以及动态的购物车和推荐产品](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/light/thinking-in-ppr.png)

每个生成的静态外壳都可以直接从 CDN 提供，无需经过上游服务器。这使得直接导航可以[瞬时完成](#即时导航instant-navigation)。

路由静态外壳中最终包含什么，取决于构建时已知的信息。当路由的[动态参数](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)已知时，外壳会包含具体的内容，而其余未缓存或运行时数据仍会在其 `<Suspense>` 回退之后流式传入。当参数未知时，可复用的、与 URL 无关的版本就是[**应用外壳（App Shell）**](https://nextjs.org/docs/app/glossary#app-shell)：同一个静态外壳，只是参数相关的部分被留在了回退之后。[增量静态再生（ISR）](#增量静态再生incremental-static-regeneration)会在首次访问之后填充具体版本。

Next.js 要求你显式处理无法在预渲染期间完成的组件。它会在开发者工具浮层和开发服务器控制台中显示一条验证洞察，指明路由名称并指向修复方案（缓存该访问、将其移入 `<Suspense>` 边界，或让路由退出）。这种验证确保每个路由都能生成静态外壳，从而使直接导航保持瞬时。

![图表展示客户端上部分渲染的页面，正在流式传输的块显示加载 UI](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/docs/light/server-rendering-with-streaming.png)

> **🎥 观看：** 为什么需要部分预渲染以及它如何工作 → [YouTube（10 分钟）](https://www.youtube.com/watch?v=MTcPrTIBkpA)。

### 最大化静态外壳

异步工作在组件树中埋得越深，页面可以被预渲染的部分就越多。这是 Cache Components 所鼓励的结构性模式：一种值得在任何地方应用的通用实践，也是接下来即时导航和预取的基础。它适用于所有[运行时 API](#与运行时-api-协作)以及诸如数据获取之类的异步操作。

考虑一个在顶层解构 `params` 的布局：

```tsx filename="app/shop/[slug]/layout.tsx"
export default async function Layout({
  children,
  params,
}: LayoutProps<'/shop/[slug]'>) {
  const { slug } = await params

  return (
    <div>
      <Sidebar />
      <h1>{slug}</h1>
      {children}
    </div>
  )
}
```

如果该参数是动态的（不是由 [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) 提供的），它就是运行时数据，该布局便无法被预渲染。

不过，通常可以在这个参数在树中更下层的位置读取它。与其在布局层级 await，不如将 params 的 promise 向下传递并在那里 await：

```tsx filename="app/shop/[slug]/layout.tsx" highlight={3-4,11-16}
import { Suspense } from 'react'

// 非 async：此布局从不 await params
export default function Layout({
  children,
  params,
}: LayoutProps<'/shop/[slug]'>) {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<h1>Loading...</h1>}>
        {/* await 发生在边界内部，因此外壳仍然可以渲染 */}
        {params.then(({ slug }) => (
          <SlugHeading slug={slug} />
        ))}
      </Suspense>
      {children}
    </div>
  )
}

function SlugHeading({ slug }: { slug: string }) {
  return <h1>{slug}</h1>
}
```

现在 `<Sidebar />`、`{children}` 和 Suspense 回退都成为静态外壳的一部分。只有 `SlugHeading` 会在请求时流式传入。你也可以传递整个 `params` promise 并在子组件中 await。

同样的原则也适用于 `cookies()`、`headers()`、`searchParams` 和数据获取。相关模式请参见[使用 `React.cache` 复用数据](https://nextjs.org/docs/app/getting-started/fetching-data#reusing-data-with-reactcache)。

### 即时导航（Instant navigation）

Cache Components 在 16.0.0 中发布时，就包含了对直接访问路由会产生静态外壳的验证。客户端导航则有所不同：在直接访问时覆盖某个内容的 `<Suspense>` 边界，在导航转换期间可能并不参与渲染。当框架介入时，把这种结构做对会更容易。Cache Components 现在也会验证这些导航，为你提供洞察和错误提示，引导你让导航到你的路由变得即时。例如，将数据包裹在 `<Suspense>` 中、使用 `use cache` 缓存它，或调整访问发生的位置。

请阅读[即时导航指南](https://nextjs.org/docs/app/guides/instant-navigation)以获取示例和检查工具。

### 预取（Prefetching）

在启用[部分预取（Partial Prefetching）](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching)的情况下，路由器默认会预取每个路由的[应用外壳（App Shell）](https://nextjs.org/docs/app/glossary#app-shell)。应用外壳包含静态内容以及派生自 `cookies()` 和 `headers()` 的会话数据。要额外预取依赖于链接 **URL 数据**（例如 `searchParams` 或动态 `params`）的缓存内容，请在该链接上设置 `prefetch={true}`。

当 [`<Link prefetch={true}>`](https://nextjs.org/docs/app/api-reference/components/link#prefetch) 指向一个启用了[部分预取](https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching)的路由时，Next.js 会在预取时再次渲染该路由的组件树，这一次目标 URL 已被解析。同样的规则依然适用，但由于 `searchParams` 和 `params` 已在作用域内，组件树中会有更多部分得以解析：

* 使用从运行时 API 提取的值（作为参数传入）调用的 [`use cache`](#用法usage) 会加入每个链接的预取
* [`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private) 在服务器上执行，直接读取运行时数据，并将结果缓存在浏览器中，作为每个链接预取的一部分
* [`<Suspense>`](#流式传输未缓存的数据) 回退会保留在被预取的 UI 中，而未缓存的内容则在请求时流式传入

这种每个链接的预取包含了在目标 URL 确定之后才能解析的缓存内容。它的代价是每个可预取的链接都需要一次服务器调用。

例如，考虑一个从 URL 读取 `searchParams` 的搜索页面：

```tsx filename="app/search/page.tsx"
import { Suspense } from 'react'

export default function SearchPage(props: PageProps<'/search'>) {
  return (
    <Suspense fallback={<p>Loading results...</p>}>
      <Results searchParams={props.searchParams} />
    </Suspense>
  )
}

async function Results({
  searchParams,
}: Pick<PageProps<'/search'>, 'searchParams'>) {
  const { q } = await searchParams
  const results = await search(q)
  return (
    <ul>
      {results.map((result) => (
        <li key={result.id}>{result.title}</li>
      ))}
    </ul>
  )
}

async function search(query: string | string[] | undefined) {
  'use cache'
  return db.search(query)
}
```

在直接访问时，`<Results>` 会在回退之后流式传入。

当指向 `/search?q=shoes` 的 [`<Link>`](https://nextjs.org/docs/app/api-reference/components/link) 被预取时，框架会从链接的 URL 中解析 `searchParams`，因此缓存的 `search` 结果会在点击之前就被包含进运行时预渲染。随后浏览器会复用该结果，直到其 [`stale`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#stale) 时间结束或 `searchParams` 发生变化。

请参阅[采用部分预取](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)以了解 `<Link>` 预取的行为以及如何采用它。

完整的模式请参见[优化预取指南](https://nextjs.org/docs/app/guides/optimizing-prefetching)，所有模式请参见 [`prefetch` 参考](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/prefetch)。

## 缓存内容存储在哪里

缓存函数的输出会被序列化为一个 **RSC payload**（在构建时或运行时）。其他一切都基于这个 payload 工作。Next.js 会将其渲染为 HTML、保存在服务器或远程存储中，或者发送到浏览器，而 [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife) 则决定了每份副本保持新鲜的时间：

* **预渲染的 HTML。** payload 被渲染为 HTML，在自托管时存储在磁盘上，或在你的平台的 CDN 背后的持久存储中。该 HTML 在构建时就是[静态外壳](#预渲染prerendering)，在 [ISR](#增量静态再生incremental-static-regeneration) 升级之后则是具体的页面，其中 [`revalidate`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#revalidate) 和 [`expire`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#expire) 控制着它何时被重建。
* **共享存储。** 默认情况下，结果保存在每个实例的内存存储中，这在 serverless 环境下是临时性的。[`use cache: remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) 会将其移动到跨实例共享的持久[缓存处理程序（cache handler）](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers)中，这是一次网络往返，只有在**高命中率**下才划算。
* **浏览器。** payload 被包含在为客户端导航或[预取](#预取prefetching)而发送的 RSC 中，浏览器会在其 [`stale`](https://nextjs.org/docs/app/api-reference/functions/cacheLife#stale) 窗口内保持它的新鲜。[`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private) 的结果只保存在这里。

> **须知**：读取 `cookies()` 或 `headers()` 的[应用外壳（App Shell）](https://nextjs.org/docs/app/glossary#app-shell)是会话特定的，它按会话缓存在客户端上，而不是在共享的服务器缓存中。

所有这些存储都限定于单次部署。一次新的部署会从零开始：构建新的预渲染，`use cache` 条目不会延续——即使是持久的 [`remote`](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote) 条目也一样，因为[缓存键](https://nextjs.org/docs/app/api-reference/directives/use-cache#cache-keys)中包含了构建 id（build id）。关于各环境下的行为，请参见[运行时缓存注意事项](https://nextjs.org/docs/app/api-reference/directives/use-cache#runtime-caching-considerations)；关于配置服务器缓存，请参见[自托管](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr)。

## 增量静态再生（Incremental Static Regeneration）

在包含动态参数段的路由中，[`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) 会在构建时预渲染你列出的 URL。任何其他 URL 都会被立即提供[应用外壳（App Shell）](https://nextjs.org/docs/app/glossary#app-shell)，然后在后台使用现已确定的参数进行升级，并为下一位访客缓存。

完整的流程请参见 [ISR 与 Cache Components](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components)。

## 机器人与爬虫

浏览器会立即收到静态外壳。机器人和爬虫则通过其 user agent 被识别，并以不同的方式处理：由于它们需要一份完整的文档，Next.js 会跳过外壳，在请求时动态渲染整个页面，然后在渲染完成后一次性发送完成的 HTML。

由于外壳是被重新渲染而不是被复用，预渲染期间完成的工作现在会在机器人请求时重新执行。如果你的外壳的某部分依赖于只在预渲染期间才存在的输入，例如构建时数据或在请求时环境中无法获取的值，那么对人类可以正常加载的页面对爬虫可能渲染失败。请确保外壳所依赖的数据在请求时同样可用。更多细节请参见流式传输指南中的[机器人与爬虫](https://nextjs.org/docs/app/guides/streaming#bots-and-crawlers)。

## 下一步（Next Steps）

进一步了解重新验证以及本页提到的 API。

- [重新验证（Revalidating）](https://nextjs.org/docs/app/getting-started/revalidating)
  - 了解如何使用基于时间和按需策略来重新验证缓存数据。
- [use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)
  - 了解如何在 Next.js 应用中使用 `use cache` 指令缓存数据。
- [cacheComponents](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
  - 了解如何在 Next.js 中启用 cacheComponents 标志。
- [即时导航（Instant navigation）](https://nextjs.org/docs/app/guides/instant-navigation)
  - 了解如何组织应用结构以预取和预渲染更多内容，提供即时的页面加载和客户端导航。
