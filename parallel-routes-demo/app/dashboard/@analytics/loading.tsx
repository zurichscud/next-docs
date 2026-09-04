export default function AnalyticsLoading() {
  return (
    <>
      <h2>数据分析加载中…</h2>
      <span className="path">app/dashboard/@analytics/loading.tsx</span>
      <div style={{ marginTop: 14 }}>
        <div className="skeleton" style={{ height: 18, width: "70%" }} />
        <div className="skeleton" style={{ height: 18, width: "50%" }} />
        <div className="skeleton" style={{ height: 18, width: "60%" }} />
        <div className="skeleton" style={{ height: 18, width: "40%" }} />
      </div>
    </>
  );
}
