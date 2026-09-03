import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <h1>Next.js 平行路由（Parallel Routes）</h1>
      <p className="subtitle">
        在同一个布局中同时或条件性地渲染多个页面 —— 使用 <code>@slot</code> 命名文件夹
      </p>

      <div className="note">
        平行路由通过 <strong>@文件夹约定</strong>（如 <code>app/dashboard/@analytics</code>）
        创建"插槽（Slot）"，插槽作为 props 传给同级的 <code>layout.tsx</code>，
        让多个独立页面共享同一个布局，且各自拥有独立的 <code>loading</code>、
        <code>error</code>、<code>404</code> 处理和导航状态。
      </div>

      <div className="grid-2">
        <div className="panel slot-main">
          <h2>场景 1 · 仪表盘</h2>
          <span className="path">@analytics + @team</span>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            多个业务面板独立加载（各自 loading.tsx 流式渲染）、互不阻塞，
            跳转子页面时通过 default.tsx 保持面板不消失。
          </p>
          <div className="btn-row">
            <Link className="btn" href="/dashboard">查看 →</Link>
          </div>
        </div>

        <div className="panel slot-modal">
          <h2>场景 2 · Modal 弹窗</h2>
          <span className="path">@modal + 拦截路由 (.)</span>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            相册页点击图片 → 弹窗覆盖在列表之上（URL 同步变化）；
            直接刷新/分享链接 → 打开完整详情页。
          </p>
          <div className="btn-row">
            <Link className="btn" href="/photos">查看 →</Link>
          </div>
        </div>
      </div>

      <h2 style={{ margin: "40px 0 12px" }}>目录结构总览</h2>
      <pre>{`app/
├─ dashboard/                ← 场景 1：仪表盘
│  ├─ layout.tsx             接收 children + analytics + team 插槽
│  ├─ page.tsx               主内容（children）
│  ├─ @analytics/            统计面板插槽
│  │  ├─ page.tsx            带 1.5s 模拟延迟
│  │  ├─ loading.tsx         独立骨架屏
│  │  └─ default.tsx         软导航兜底
│  ├─ @team/                 团队面板插槽（同上）
│  └─ settings/page.tsx      验证 default.tsx 的作用
│
├─ photos/                   ← 场景 2：Modal
│  ├─ layout.tsx             children + modal 插槽叠放
│  ├─ page.tsx               图片墙
│  ├─ [id]/page.tsx          完整详情页（刷新/直达）
│  └─ @modal/
│     ├─ default.tsx         关闭态（返回 null）
│     └─ (.)[id]/page.tsx    拦截 /photos/[id] → 渲染弹窗
`}</pre>
    </div>
  );
}
