export default function AnalyticsDefault() {
  return (
    <>
      <h2>
        数据分析 <span className="badge badge-blue">@analytics</span>
      </h2>
      <span className="path">app/dashboard/@analytics/default.tsx</span>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>
        当前 URL（/dashboard/settings）在 @analytics 中没有对应页面，
        这里是 default.tsx 提供的兜底 UI —— 如果没有它，软导航时会 404。
      </p>
    </>
  );
}
