import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js 平行路由 Demo",
  description: "Parallel Routes 使用场景演示",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav className="topnav">
          <span className="logo">Parallel Routes Demo</span>
          <div className="nav-links">
            <Link href="/">介绍</Link>
            <Link href="/dashboard">场景 1 · 仪表盘</Link>
            <Link href="/photos">场景 2 · Modal 弹窗</Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
