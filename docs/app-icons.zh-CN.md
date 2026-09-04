# favicon、icon 和 apple-icon

> 原文：https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
>
> 版本：16.3.4 ｜ 最后更新：2026-03-03

`favicon`、`icon` 或 `apple-icon` 文件约定允许你为应用设置图标。

它们非常适合用于添加应用图标，这些图标会显示在浏览器标签页、手机主屏幕以及搜索引擎结果等位置。

设置应用图标有两种方式：

* [使用图像文件（.ico、.jpg、.png）](#图像文件-ico-jpg-png)
* [使用代码生成图标（.js、.ts、.tsx）](#使用代码生成图标-js-ts-tsx)

## 图像文件（.ico, .jpg, .png）

通过在 `/app` 目录中放置一个 `favicon`、`icon` 或 `apple-icon` 图像文件，即可使用图像文件来设置应用图标。其中 `favicon` 图像只能位于 `app/` 的顶层。

Next.js 会评估该文件，并自动将相应的标签添加到你应用的 `<head>` 元素中。

| 文件约定                     | 支持的文件类型                          | 有效位置        |
| --------------------------- | --------------------------------------- | --------------- |
| [`favicon`](#favicon)       | `.ico`                                  | `app/`          |
| [`icon`](#icon)             | `.ico`、`.jpg`、`.jpeg`、`.png`、`.svg` | `app/**/*`      |
| [`apple-icon`](#apple-icon) | `.jpg`、`.jpeg`、`.png`                 | `app/**/*`      |

### `favicon`

将一个 `favicon.ico` 图像文件添加到根 `/app` 路由段中。

```html filename="<head> output"
<link rel="icon" href="/favicon.ico" sizes="any" />
```

### `icon`

添加一个 `icon.(ico|jpg|jpeg|png|svg)` 图像文件。

```html filename="<head> output"
<link
  rel="icon"
  href="/icon?<generated>"
  type="image/<generated>"
  sizes="<generated>"
/>
```

### `apple-icon`

添加一个 `apple-icon.(jpg|jpeg|png)` 图像文件。

```html filename="<head> output"
<link
  rel="apple-touch-icon"
  href="/apple-icon?<generated>"
  type="image/<generated>"
  sizes="<generated>"
/>
```

> **须知**：
>
> * 你可以通过在文件名后面添加数字后缀来设置多个图标。例如 `icon1.png`、`icon2.png` 等。带数字的文件将按字典序排序。
> * favicon 只能在根 `/app` 段中设置。如果需要更细的粒度，可以使用 [`icon`](#icon)。
> * 相应的 `<link>` 标签及其属性（如 `rel`、`href`、`type` 和 `sizes`）由图标类型以及被评估文件的元数据决定。
> * 例如，一个 32×32px 的 `.png` 文件会带有 `type="image/png"` 和 `sizes="32x32"` 属性。
> * 当扩展名为 `.svg` 或文件图像尺寸无法确定时，图标会添加 `sizes="any"`。更多细节请参阅这篇 [favicon 手册](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)。

## 使用代码生成图标（.js, .ts, .tsx）

除了使用[字面图像文件](#图像文件-ico-jpg-png)之外，你还可以使用代码**程序化地生成**图标。

通过创建一个 `icon` 或 `apple-icon` 路由并默认导出一个函数，即可生成应用图标。

| 文件约定        | 支持的文件类型       |
| --------------- | -------------------- |
| `icon`          | `.js`、`.ts`、`.tsx` |
| `apple-icon`    | `.js`、`.ts`、`.tsx` |

生成图标最简单的方式是使用 `next/og` 中的 [`ImageResponse`](https://nextjs.org/docs/app/api-reference/functions/image-response) API。

```tsx filename="app/icon.tsx" switcher
import { ImageResponse } from 'next/og'

// 图像元数据
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// 图像生成
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX 元素
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        A
      </div>
    ),
    // ImageResponse 选项
    {
      // 为了方便，我们可以复用导出的图标 size 元数据
      // 配置来同时设置 ImageResponse 的宽度和高度。
      ...size,
    }
  )
}
```

```jsx filename="app/icon.js" switcher
import { ImageResponse } from 'next/og'

// 图像元数据
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// 图像生成
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX 元素
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        A
      </div>
    ),
    // ImageResponse 选项
    {
      // 为了方便，我们可以复用导出的图标 size 元数据
      // 配置来同时设置 ImageResponse 的宽度和高度。
      ...size,
    }
  )
}
```

```html filename="<head> output"
<link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />
```

> **须知**：
>
> * 默认情况下，生成的图标会进行[**静态优化**](https://nextjs.org/docs/app/glossary#prerendering)（在构建时生成并缓存），除非它们使用了[请求时 API（Request-time APIs）](https://nextjs.org/docs/app/glossary#request-time-apis)或未缓存的数据。
> * 你可以使用 [`generateImageMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata) 在同一个文件中生成多个图标。
> * 你无法生成 `favicon` 图标。请改用 [`icon`](#icon) 或 [favicon.ico](#favicon) 文件。
> * 应用图标是特殊的路由处理程序（Route Handlers），默认会被缓存，除非它们使用了[请求时 API](https://nextjs.org/docs/app/glossary#request-time-apis) 或[动态配置](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic)选项。

### Props（属性）

默认导出的函数会接收以下 props：

#### `params`（可选）

一个 promise，它解析为一个对象，包含从根段到 `icon` 或 `apple-icon` 所在段为止的[动态路由参数](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)对象。

> **须知**：如果你使用了 [`generateImageMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata)，该函数还会接收到一个 `id` prop，它是一个解析为 `generateImageMetadata` 返回的某一项中 `id` 值的 promise。

```tsx filename="app/shop/[slug]/icon.tsx" switcher
export default async function Icon({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // ...
}
```

```jsx filename="app/shop/[slug]/icon.js" switcher
export default async function Icon({ params }) {
  const { slug } = await params
  // ...
}
```

| 路由                            | URL         | `params`                           |
| ------------------------------- | ----------- | ---------------------------------- |
| `app/shop/icon.js`              | `/shop`     | `undefined`                        |
| `app/shop/[slug]/icon.js`       | `/shop/1`   | `Promise<{ slug: '1' }>`           |
| `app/shop/[tag]/[item]/icon.js` | `/shop/1/2` | `Promise<{ tag: '1', item: '2' }>` |

### 返回值

默认导出的函数应当返回一个 `Blob` | `ArrayBuffer` | `TypedArray` | `DataView` | `ReadableStream` | `Response`。

> **须知**：`ImageResponse` 满足这一返回类型。

### 配置导出

你可以选择性地通过从 `icon` 或 `apple-icon` 路由中导出 `size` 和 `contentType` 变量来配置图标的元数据。

| 选项                          | 类型                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`size`](#size)               | `{ width: number; height: number }`                                                                             |
| [`contentType`](#contenttype) | `string` - [图像 MIME 类型](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types#image_types) |

#### `size`

```tsx filename="icon.tsx | apple-icon.tsx" switcher
export const size = { width: 32, height: 32 }

export default function Icon() {}
```

```jsx filename="icon.js | apple-icon.js" switcher
export const size = { width: 32, height: 32 }

export default function Icon() {}
```

```html filename="<head> output"
<link rel="icon" sizes="32x32" />
```

#### `contentType`

```tsx filename="icon.tsx | apple-icon.tsx" switcher
export const contentType = 'image/png'

export default function Icon() {}
```

```jsx filename="icon.js | apple-icon.js" switcher
export const contentType = 'image/png'

export default function Icon() {}
```

```html filename="<head> output"
<link rel="icon" type="image/png" />
```

#### 路由段配置（Route Segment Config）

`icon` 和 `apple-icon` 是特殊化的[路由处理程序](https://nextjs.org/docs/app/api-reference/file-conventions/route)，可以使用与页面和布局相同的[路由段配置](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)选项。

## 版本历史（Version History）

| 版本       | 变更                                        |
| ---------- | ------------------------------------------- |
| `v16.0.0`  | `params` 现在是一个解析为对象的 promise     |
| `v13.3.0`  | 引入 `favicon`、`icon` 和 `apple-icon`      |
