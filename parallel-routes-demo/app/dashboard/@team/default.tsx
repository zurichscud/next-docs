export default function TeamDefault() {
  return (
    <>
      <h2>
        团队成员 <span className="badge badge-green">@team</span>
      </h2>
      <span className="path">app/dashboard/@team/default.tsx</span>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>
        来自 default.tsx 的兜底 UI。
      </p>
    </>
  );
}
