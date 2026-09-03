import Link from "next/link";
import Modal from "./Modal";
import { getPhoto } from "@/app/photos/photos";

export default async function PhotoModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = getPhoto(id);

  if (!photo) return null;

  return (
    <Modal>
      <h2>
        {photo.title}
        <span className="badge badge-purple">@modal 拦截渲染</span>
      </h2>
      <span className="path">app/photos/@modal/(.)[id]/page.tsx</span>
      <span className="photo-hero" style={{ background: photo.gradient }} />
      <p style={{ fontSize: 14, color: "var(--muted)" }}>
        URL 已经是 <code>/photos/{id}</code>，但被拦截路由渲染成了弹窗，
        图片墙依然保留在弹窗后面。
      </p>
    </Modal>
  );
}
