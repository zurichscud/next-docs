export default function TeamLoading() {
  return (
    <>
      <h2>团队成员加载中…</h2>
      <span className="path">app/dashboard/@team/loading.tsx</span>
      <div style={{ marginTop: 14 }}>
        <div className="skeleton" style={{ height: 18, width: "55%" }} />
        <div className="skeleton" style={{ height: 18, width: "65%" }} />
        <div className="skeleton" style={{ height: 18, width: "45%" }} />
      </div>
    </>
  );
}
