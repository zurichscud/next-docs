import Link from "next/link";
import { getPhoto } from "../photos";

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = getPhoto(id);

  if (!photo) {
    return (
      <div className="container">
        <h1>404 · 未找到图片</h1>
        <Link className="btn" href="/photos">← 返回相册</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>
        {photo.title}
        <span className="badge badge-purple">完整页面</span>
      </h1>
      <p className="subtitle">
        这是 photos/[id]/page.tsx —— 刷新、直接访问、分享链接时渲染的正式页面
      </p>
      <span
        className="photo-hero"
        style={{ background: photo.gradient }}
        aria-label={photo.title}
      />
      <p style={{ fontSize: 14, color: "var(--muted)" }}>
        从相册点击进来时你看到的是弹窗（被 @modal/(.)[id] 拦截）；
        而当前是完整页面，因为请求来自服务端（刷新/直达），拦截路由只对客户端软导航生效。
      </p>
      <div className="btn-row">
        <Link className="btn" href="/photos">← 返回相册</Link>
      </div>
    </div>
  );
}
