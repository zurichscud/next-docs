import Link from "next/link";

export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="container">
      <h1>场景 1 · 仪表盘：多个面板并行渲染</h1>
      <p className="subtitle">
        三个插槽各自独立加载、独立导航、互不阻塞 —— 这就是平行路由最经典的使用场景
      </p>

      <div className="note">
        <strong>注意观察：</strong>
        页面会先立刻显示主内容和团队面板，而 <code>@analytics</code> 面板
        因为数据慢（1.5s 模拟延迟）会先显示自己的骨架屏（<code>@analytics/loading.tsx</code>），
        加载完成后单独填充 —— <strong>一个插槽慢不会阻塞其他插槽</strong>。
        再点击下方"设置"链接，观察 <code>default.tsx</code> 如何保住面板。
      </div>

      <div className="btn-row" style={{ marginBottom: 20 }}>
        <Link className="btn" href="/dashboard/settings">
          前往 /dashboard/settings（验证 default.tsx）→
        </Link>
      </div>

      <div className="grid-2">
        <div className="panel slot-main" style={{ gridColumn: "1 / -1" }}>
          {children}
        </div>

        <div className="panel slot-analytics">{analytics}</div>

        <div className="panel slot-team">{team}</div>
      </div>
    </div>
  );
}
