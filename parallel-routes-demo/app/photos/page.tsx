import Link from "next/link";
import { photos } from "./photos";

export default function PhotosPage() {
  return (
    <div className="container">
      <h1>场景 2 · 相册：点击图片体验 Modal</h1>
      <p className="subtitle">
        平行路由 + 拦截路由（Intercepting Routes）最流行的组合用法
      </p>

      <div className="note">
        <strong>点击任意图片试试：</strong>
        URL 会变成 <code>/photos/1</code>，但页面被 <code>@modal/(.)[id]</code>{" "}
        拦截，渲染成覆盖在图片墙上的弹窗。
        此时<strong>刷新浏览器</strong>或直接打开链接，拦截不再生效，
        你会看到 <code>photos/[id]/page.tsx</code> 的完整详情页 —— 弹窗和详情共用同一个 URL，
        非常适合分享。
      </div>

      <div className="gallery">
        {photos.map((p) => (
          <Link key={p.id} href={`/photos/${p.id}`} className="photo-card">
            <span className="photo-tile" style={{ background: p.gradient }} />
            <div className="photo-caption">{p.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
