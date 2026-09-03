export default async function AnalyticsPage() {
  // 模拟耗时的数据请求，用于演示独立 loading
  await new Promise((r) => setTimeout(r, 1500));

  return (
    <>
      <h2>
        数据分析 <span className="badge badge-blue">@analytics</span>
      </h2>
      <span className="path">app/dashboard/@analytics/page.tsx</span>
      <ul className="stat-list">
        <li>
          今日访问 <span className="num">12,480</span>
        </li>
        <li>
          转化率 <span className="num up">↑ 3.2%</span>
        </li>
        <li>
          平均停留 <span className="num">4m 36s</span>
        </li>
        <li>
          跳出率 <span className="num down">↓ 1.8%</span>
        </li>
      </ul>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>
        这个插槽有 1.5 秒模拟延迟，加载期间显示的是 @analytics/loading.tsx
      </p>
    </>
  );
}
