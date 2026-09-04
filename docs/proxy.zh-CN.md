# 代理（Proxy）

> 原文：https://nextjs.org/docs/app/getting-started/proxy
>
> 版本：16.3.4 ｜ 最后更新：2025-12-20

> **须知**：从 Next.js 16 开始，Middleware 更名为 Proxy（代理），以便更好地反映其用途。功能保持不变。

代理（Proxy）允许你在请求完成之前运行代码。然后，你可以根据传入的请求，通过重写（rewrite）、重定向（redirect）、修改请求或响应头，或直接响应来修改响应结果。

## 使用场景

代理发挥作用的一些常见场景包括：

* 为所有页面或部分页面修改请求头
* 基于 A/B 测试或实验重写到不同的页面
* 根据传入请求的属性进行程序化重定向

对于简单的重定向，请优先考虑使用 `next.config.ts` 中的 [`redirects`](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) 配置。当你需要访问请求数据或需要更复杂的逻辑时，才应使用代理。

代理*不适合*用于缓慢的数据获取。虽然代理对于[乐观检查（optimistic checks）](https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional)（例如基于权限的重定向）很有帮助，但它不应被用作完整的会话管理或授权解决方案。

在代理中使用 fetch 的 `options.cache`、`options.next.revalidate` 或 `options.next.tags` 不会产生任何效果。

## 约定（Convention）

在项目根目录下（如适用，也可以在 `src` 目录内）创建一个 `proxy.ts`（或 `.js`）文件，使其与 `pages` 或 `app` 位于同一层级。

> **注意**：虽然每个项目只支持一个 `proxy.ts` 文件，但你仍然可以将代理逻辑组织成多个模块。你可以把不同的代理功能拆分到独立的 `.ts` 或 `.js` 文件中，然后将它们导入主 `proxy.ts` 文件。这样可以更清晰地管理各路由特定的代理逻辑，并在 `proxy.ts` 中进行聚合以实现集中控制。强制使用单一的代理文件可以简化配置、避免潜在的冲突，并通过减少多层代理来优化性能。

## 示例（Example）

你可以将代理函数导出为默认导出（default export），或命名导出 `proxy`：

```ts filename="proxy.ts" switcher
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 如果内部使用了 `await`，可以将此函数标记为 `async`
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// 或者，你也可以使用默认导出：
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: '/about/:path*',
}
```

```js filename="proxy.js" switcher
import { NextResponse } from 'next/server'

// 如果内部使用了 `await`，可以将此函数标记为 `async`
export function proxy(request) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// 或者，你也可以使用默认导出：
// export default function proxy(request) { ... }

export const config = {
  matcher: '/about/:path*',
}
```

`matcher` 配置允许你过滤代理，使其只在特定路径上运行。关于路径匹配的更多细节，请参见 [Matcher](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher) 文档。

了解更多关于[使用 `proxy`](https://nextjs.org/docs/app/guides/backend-for-frontend#proxy) 的内容，或参阅 `proxy` 的 [API 参考](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)。

## API 参考

进一步了解代理（Proxy）。

- [proxy.js](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
  - `proxy.js` 文件的 API 参考。
- [Backend for Frontend（BFF）](https://nextjs.org/docs/app/guides/backend-for-frontend)
  - 了解如何将 Next.js 用作后端框架。
