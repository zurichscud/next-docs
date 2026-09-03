import Link from "next/link";

export default function SettingsPage() {
  return (
    <>
      <h2>
        设置 <span className="path">app/dashboard/settings/page.tsx</span>
      </h2>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>
        两个平行路由插槽都没有 settings/page.tsx，所以下方面板此刻来自{" "}
        <code>default.tsx</code> 兜底 —— 若删掉 default.tsx，软导航到这里会整页 404。
      </p>
      <Link className="btn" href="/dashboard">
        ← 返回仪表盘
      </Link>
    </>
  );
}
