export default async function TeamPage() {
  // 较短的延迟，演示不同插槽加载速度互不影响
  await new Promise((r) => setTimeout(r, 600));

  return (
    <>
      <h2>
        团队成员 <span className="badge badge-green">@team</span>
      </h2>
      <span className="path">app/dashboard/@team/page.tsx</span>
      <ul className="stat-list">
        <li>
          张伟 · 前端 <span className="num">在线</span>
        </li>
        <li>
          李娜 · 后端 <span className="num">在线</span>
        </li>
        <li>
          王强 · 设计 <span className="num down">离开</span>
        </li>
        <li>
          赵敏 · 产品 <span className="num">在线</span>
        </li>
      </ul>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>
        这个插槽只要 0.6 秒，加载完成也不会影响还在加载的 @analytics
      </p>
    </>
  );
}
