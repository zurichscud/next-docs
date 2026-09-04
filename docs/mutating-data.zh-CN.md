# 变更数据（Mutating Data）

> 原文：https://nextjs.org/docs/app/getting-started/mutating-data
>
> 版本：16.3.4 ｜ 最后更新：2026-08-25

你可以使用 [React Server Functions（服务器函数）](https://react.dev/reference/rsc/server-functions)在 Next.js 中变更数据。本页将介绍如何[创建](#创建-server-functions)和[调用](#调用-server-functions) Server Function。关于 Next.js 特有的行为（单次往返响应、顺序派发、安全性、部署），请参阅 [Server Actions and Mutations](https://nextjs.org/docs/app/guides/server-actions)。

## 什么是 Server Function？

**Server Function（服务器函数）** 是一种在服务器上运行的异步函数。你可以通过网络请求从客户端调用它们，这也是它们必须为异步函数的原因。

在 `action` 或数据变更（mutation）的上下文中，它们也被称为 **Server Actions（服务器操作）**。

按照约定，Server Action 是与 [`startTransition`](https://react.dev/reference/react/startTransition) 配合使用的异步函数。当该函数出现以下情况时，这一过程会自动完成：

* 通过 `action` prop 传递给 `<form>`。
* 通过 `formAction` prop 传递给 `<button>`。

当操作（action）被调用时，Next.js 可以在单次服务器往返中同时返回更新后的 UI 和新数据。

在底层，action 使用 `POST` 方法，且只有这一种 HTTP 方法可以调用它们。

> \[!WARNING]
> Server Function 可以通过直接发送 POST 请求访问到，而不仅仅通过应用 UI。请务必在每个 Server Function 内部验证身份认证（authentication）与授权（authorization）。推荐模式请参阅[数据安全指南](https://nextjs.org/docs/app/guides/data-security#authentication-and-authorization)。

> **须知：** Server Action 是以特定方式使用的 Server Function（用于处理表单提交和数据变更）。Server Function 是更宽泛的术语。

## 创建 Server Functions

可以使用 [`use server`](https://react.dev/reference/rsc/use-server) 指令来定义 Server Function。你可以将该指令放在**异步**函数的顶部，把该函数标记为 Server Function；也可以放在单独文件的顶部，把该文件的所有导出都标记为 Server Function。

```ts filename="app/lib/actions.ts" switcher
import { auth } from '@/lib/auth'

export async function createPost(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title')
  const content = formData.get('content')

  // 变更数据
  // 重新验证缓存
}

export async function deletePost(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const id = formData.get('id')

  // 在删除前验证用户是否拥有该资源
  // 变更数据
  // 重新验证缓存
}
```

```js filename="app/lib/actions.js" switcher
import { auth } from '@/lib/auth'

export async function createPost(formData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title')
  const content = formData.get('content')

  // 变更数据
  // 重新验证缓存
}

export async function deletePost(formData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const id = formData.get('id')

  // 在删除前验证用户是否拥有该资源
  // 变更数据
  // 重新验证缓存
}
```

### Server Components（服务器组件）

通过在函数体顶部添加 `"use server"` 指令，可以将 Server Function 内联定义在 Server Component 中：

```tsx filename="app/page.tsx" switcher
export default function Page() {
  // Server Action
  async function createPost(formData: FormData) {
    'use server'
    // ...
  }

  return <></>
}
```

```jsx filename="app/page.js" switcher
export default function Page() {
  // Server Action
  async function createPost(formData) {
    'use server'
    // ...
  }

  return <></>
}
```

> **须知：** Server Components 默认支持渐进式增强（progressive enhancement），这意味着即使 JavaScript 尚未加载或被禁用，调用 Server Actions 的表单也能正常提交。

### Client Components（客户端组件）

无法在 Client Components 中定义 Server Function。不过，你可以在 Client Components 中调用它们，只需从带有 `"use server"` 指令的文件中导入即可：

```ts filename="app/actions.ts" switcher
'use server'

export async function createPost() {}
```

```js filename="app/actions.js" switcher
'use server'

export async function createPost() {}
```

```tsx filename="app/ui/button.tsx" switcher
'use client'

import { createPost } from '@/app/actions'

export function Button() {
  return <button formAction={createPost}>Create</button>
}
```

```jsx filename="app/ui/button.js" switcher
'use client'

import { createPost } from '@/app/actions'

export function Button() {
  return <button formAction={createPost}>Create</button>
}
```

> **须知：** 在 Client Components 中，如果 JavaScript 尚未加载，调用 Server Actions 的表单会将提交操作加入队列，并优先进行水合（hydration）。水合完成后，浏览器在表单提交时不会刷新页面。

### 通过 props 传递 action

你还可以将 action 作为 prop 传递给 Client Component：

```jsx
<ClientComponent updateItemAction={updateItem} />
```

```tsx filename="app/client-component.tsx" switcher
'use client'

export default function ClientComponent({
  updateItemAction,
}: {
  updateItemAction: (formData: FormData) => void
}) {
  return <form action={updateItemAction}>{/* ... */}</form>
}
```

```jsx filename="app/client-component.js" switcher
'use client'

export default function ClientComponent({ updateItemAction }) {
  return <form action={updateItemAction}>{/* ... */}</form>
}
```

## 调用 Server Functions

调用 Server Function 主要有两种方式：

1. Server Components 和 Client Components 中的[表单（Forms）](#表单-forms)
2. Client Components 中的[事件处理器（Event Handlers）](#事件处理器-event-handlers)和 [useEffect](#useeffect)

> **须知：** Server Function 是为服务器端数据变更而设计的。目前客户端一次只会派发并等待一个 Server Function。这是一个实现细节，未来可能改变。如果你需要并行获取数据，请在 Server Components 中使用[数据获取](https://nextjs.org/docs/app/getting-started/fetching-data#server-components)，或者在单个 Server Function 或[路由处理程序](https://nextjs.org/docs/app/guides/backend-for-frontend#manipulating-data)内部执行并行工作。

### 表单（Forms）

React 对 HTML 的 [`<form>`](https://react.dev/reference/react-dom/components/form) 元素进行了扩展，允许通过 HTML 的 `action` prop 调用 Server Function。

在表单中被调用时，函数会自动接收 [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData/FormData) 对象。你可以使用原生的 [`FormData` 方法](https://developer.mozilla.org/en-US/docs/Web/API/FormData#instance_methods)提取数据：

```tsx filename="app/ui/form.tsx" switcher
import { createPost } from '@/app/actions'

export function Form() {
  return (
    <form action={createPost}>
      <input type="text" name="title" />
      <input type="text" name="content" />
      <button type="submit">Create</button>
    </form>
  )
}
```

```jsx filename="app/ui/form.js" switcher
import { createPost } from '@/app/actions'

export function Form() {
  return (
    <form action={createPost}>
      <input type="text" name="title" />
      <input type="text" name="content" />
      <button type="submit">Create</button>
    </form>
  )
}
```

```ts filename="app/actions.ts" switcher
'use server'

import { auth } from '@/lib/auth'

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title')
  const content = formData.get('content')

  // 变更数据
  // 重新验证缓存
}
```

```js filename="app/actions.js" switcher
'use server'

import { auth } from '@/lib/auth'

export async function createPost(formData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title')
  const content = formData.get('content')

  // 变更数据
  // 重新验证缓存
}
```

### 事件处理器（Event Handlers）

你可以在 Client Component 中通过 `onClick` 等事件处理器调用 Server Function：

```tsx filename="app/like-button.tsx" switcher
'use client'

import { incrementLike } from './actions'
import { useState } from 'react'

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)

  return (
    <>
      <p>Total Likes: {likes}</p>
      <button
        onClick={async () => {
          const updatedLikes = await incrementLike()
          setLikes(updatedLikes)
        }}
      >
        Like
      </button>
    </>
  )
}
```

```jsx filename="app/like-button.js" switcher
'use client'

import { incrementLike } from './actions'
import { useState } from 'react'

export default function LikeButton({ initialLikes }) {
  const [likes, setLikes] = useState(initialLikes)

  return (
    <>
      <p>Total Likes: {likes}</p>
      <button
        onClick={async () => {
          const updatedLikes = await incrementLike()
          setLikes(updatedLikes)
        }}
      >
        Like
      </button>
    </>
  )
}
```

## 示例

### 显示等待状态（pending state）

在执行 Server Function 期间，你可以使用 React 的 [`useActionState`](https://react.dev/reference/react/useActionState) Hook 显示加载指示器。该 Hook 会返回一个 `pending` 布尔值：

```tsx filename="app/ui/button.tsx" switcher
'use client'

import { useActionState, startTransition } from 'react'
import { createPost } from '@/app/actions'
import { LoadingSpinner } from '@/app/ui/loading-spinner'

export function Button() {
  const [state, action, pending] = useActionState(createPost, false)

  return (
    <button onClick={() => startTransition(action)}>
      {pending ? <LoadingSpinner /> : 'Create Post'}
    </button>
  )
}
```

```jsx filename="app/ui/button.js" switcher
'use client'

import { useActionState, startTransition } from 'react'
import { createPost } from '@/app/actions'
import { LoadingSpinner } from '@/app/ui/loading-spinner'

export function Button() {
  const [state, action, pending] = useActionState(createPost, false)

  return (
    <button onClick={() => startTransition(action)}>
      {pending ? <LoadingSpinner /> : 'Create Post'}
    </button>
  )
}
```

更深入的交互式 UI 教程（包括等待反馈、乐观更新 UI、transition 以及错误处理），请参阅[构建交互式应用](https://nextjs.org/docs/app/guides/interactive-apps)指南。

> **须知**：启用**实验性**的 [`useOffline`](https://nextjs.org/docs/app/guides/offline-support) 配置后，因网络中断而被打断的 Server Action 会保持等待状态，并在网络恢复后自动完成。

### 刷新数据（Refresh data）

数据变更之后，你可能希望刷新当前页面以展示最新数据。你可以在 Server Action 中调用来自 `next/cache` 的 [`refresh`](https://nextjs.org/docs/app/api-reference/functions/refresh) 来实现：

```ts filename="app/lib/actions.ts" switcher
'use server'

import { auth } from '@/lib/auth'
import { refresh } from 'next/cache'

export async function updatePost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // 变更数据
  // ...

  refresh()
}
```

```js filename="app/lib/actions.js" switcher
'use server'

import { auth } from '@/lib/auth'
import { refresh } from 'next/cache'

export async function updatePost(formData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // 变更数据
  // ...

  refresh()
}
```

这会刷新客户端路由器（router），确保 UI 反映最新状态。`refresh()` 函数不会重新验证带有标签（tagged）的数据。要重新验证带标签的数据，请改用 [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag) 或 [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)。

### 重新验证数据（Revalidate data）

执行数据变更后，你可以在 Server Function 内调用 [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) 或 [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) 来重新验证 Next.js 缓存，并展示更新后的数据：

```ts filename="app/lib/actions.ts" switcher
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // 变更数据
  // ...

  revalidatePath('/posts')
}
```

```js filename="app/lib/actions.js" switcher
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createPost(formData) {
  'use server'
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // 变更数据
  // ...
  revalidatePath('/posts')
}
```

### 变更后重定向（Redirect after a mutation）

你可能希望在数据变更后将用户重定向到其他页面。可以通过在 Server Function 内调用 [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect) 来实现。

```ts filename="app/lib/actions.ts" switcher
'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // 变更数据
  // ...

  revalidatePath('/posts')
  redirect('/posts')
}
```

```js filename="app/lib/actions.js" switcher
'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // 变更数据
  // ...

  revalidatePath('/posts')
  redirect('/posts')
}
```

调用 `redirect` 会[抛出](https://nextjs.org/docs/app/api-reference/functions/redirect#behavior)一个由框架处理的控制流异常，其后的任何代码都不会执行。如果你需要最新数据，请在此之前调用 [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) 或 [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)。

### Cookies

你可以在 Server Action 中使用 [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies) API 对 cookie 进行 `get`（读取）、`set`（设置）和 `delete`（删除）。

当你在 Server Action 中[设置或删除](https://nextjs.org/docs/app/api-reference/functions/cookies#understanding-cookie-behavior-in-server-functions) cookie 时，Next.js 会在服务器上重新渲染当前页面及其布局，从而使 **UI 反映新的 cookie 值**。

> **须知**：服务器的更新应用于当前 React 树，按需重新渲染、挂载或卸载组件。被重新渲染的组件会保留客户端状态（client state），并且如果 effect 的依赖发生变化，effect 会重新运行。

```ts filename="app/actions.ts" switcher
'use server'

import { cookies } from 'next/headers'

export async function exampleAction() {
  const cookieStore = await cookies()

  // 读取 cookie
  cookieStore.get('name')?.value

  // 设置 cookie
  cookieStore.set('name', 'Delba')

  // 删除 cookie
  cookieStore.delete('name')
}
```

```js filename="app/actions.js" switcher
'use server'

import { cookies } from 'next/headers'

export async function exampleAction() {
  const cookieStore = await cookies()

  // 读取 cookie
  cookieStore.get('name')?.value

  // 设置 cookie
  cookieStore.set('name', 'Delba')

  // 删除 cookie
  cookieStore.delete('name')
}
```

### useEffect

你可以使用 React 的 [`useEffect`](https://react.dev/reference/react/useEffect) Hook 在组件挂载或依赖变化时调用 Server Action。这对于依赖全局事件的变更操作，或需要自动触发的场景非常有用。例如：应用快捷键的 `onKeyDown`、无限滚动的 intersection observer Hook，或在组件挂载时更新浏览量：

```tsx filename="app/view-count.tsx" switcher
'use client'

import { incrementViews } from './actions'
import { useState, useEffect, useTransition } from 'react'

export default function ViewCount({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState(initialViews)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const updatedViews = await incrementViews()
      setViews(updatedViews)
    })
  }, [])

  // 你可以使用 `isPending` 向用户提供反馈
  return <p>Total Views: {views}</p>
}
```

```jsx filename="app/view-count.js" switcher
'use client'

import { incrementViews } from './actions'
import { useState, useEffect, useTransition } from 'react'

export default function ViewCount({ initialViews }) {
  const [views, setViews] = useState(initialViews)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const updatedViews = await incrementViews()
      setViews(updatedViews)
    })
  }, [])

  // 你可以使用 `isPending` 向用户提供反馈
  return <p>Total Views: {views}</p>
}
```

## 后续步骤

进一步了解 Server Actions 以及本页提到的 API：

- [Server Actions](https://nextjs.org/docs/app/guides/server-actions)
  - Server Actions 在 Next.js 中的工作方式，包括单次往返响应模型、顺序派发、安全性以及缓存集成。
- [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
  - revalidatePath 函数的 API 参考。
- [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
  - revalidateTag 函数的 API 参考。
- [redirect](https://nextjs.org/docs/app/api-reference/functions/redirect)
  - redirect 函数的 API 参考。
