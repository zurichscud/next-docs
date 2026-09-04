# NextRequest

> 原文：https://nextjs.org/docs/app/api-reference/functions/next-request
>
> 版本：16.3.4 ｜ 最后更新：2025-12-04

`NextRequest` 扩展了 [Web Request API](https://developer.mozilla.org/docs/Web/API/Request)，提供了额外的便捷方法。

## `cookies`

读取或修改请求的 [`Set-Cookie`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie) 请求头。

### `set(name, value)`

根据给定的名称，在请求上设置一个具有给定值的 cookie。

```ts
// 假设传入的请求为 /home
// 设置一个 cookie 来隐藏横幅（banner）
// 请求将带有 `Set-Cookie:show-banner=false;path=/home` 请求头
request.cookies.set('show-banner', 'false')
```

### `get(name)`

根据给定的 cookie 名称，返回该 cookie 的值。如果未找到该 cookie，则返回 `undefined`。如果找到多个同名 cookie，则返回第一个。

```ts
// 假设传入的请求为 /home
// { name: 'show-banner', value: 'false', Path: '/home' }
request.cookies.get('show-banner')
```

### `getAll()`

根据给定的 cookie 名称，返回该 cookie 的值。如果未给定名称，则返回请求中的所有 cookie。

```ts
// 假设传入的请求为 /home
// [
//   { name: 'experiments', value: 'new-pricing-page', Path: '/home' },
//   { name: 'experiments', value: 'winter-launch', Path: '/home' },
// ]
request.cookies.getAll('experiments')
// 或者，获取请求中的所有 cookie
request.cookies.getAll()
```

### `delete(name)`

根据给定的 cookie 名称，从请求中删除该 cookie。

```ts
// 删除成功返回 true，没有删除任何内容则返回 false
request.cookies.delete('experiments')
```

### `has(name)`

根据给定的 cookie 名称，如果该 cookie 存在于请求中则返回 `true`。

```ts
// cookie 存在返回 true，不存在返回 false
request.cookies.has('experiments')
```

### `clear()`

移除请求中的所有 cookie。

```ts
request.cookies.clear()
```

## `nextUrl`

扩展了原生的 [`URL`](https://developer.mozilla.org/docs/Web/API/URL) API，提供了额外的便捷方法，包括 Next.js 特有的属性。

```ts
// 假设请求为 /home，则 pathname 为 /home
request.nextUrl.pathname
// 假设请求为 /home?name=lee，则 searchParams 为 { 'name': 'lee' }
request.nextUrl.searchParams
```

可用选项如下：

| 属性           | 类型                        | 描述                                                                                       |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `basePath`     | `string`                    | URL 的 [basePath（基础路径）](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)。 |
| `buildId`      | `string` \| `undefined`     | Next.js 应用的构建标识符（build identifier），可以进行[自定义](https://nextjs.org/docs/app/api-reference/config/next-config-js/generateBuildId)。 |
| `pathname`     | `string`                    | URL 的路径名（pathname）。                                                                 |
| `searchParams` | `Object`                    | URL 的查询参数（search parameters）。                                                       |

