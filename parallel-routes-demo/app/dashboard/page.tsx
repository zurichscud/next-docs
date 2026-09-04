export default function DashboardPage() {
  return (
    <>
      <h2>运营概览</h2>
      <p style={{ fontSize: 14, color: "var(--muted)" }}>
        这里是主内容区。左下的"数据分析"和右下的"团队成员"来自两个平行路由插槽
        <code>@analytics</code> 和 <code>@team</code>，它们是彼此完全独立的页面。
      </p>
    </>
  );
}
