"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // 打开弹窗时锁住背景滚动
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="modal-overlay"
      onClick={() => router.back()}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {children}
        <div className="modal-actions">
          <button onClick={() => router.back()}>← 关闭弹窗（返回相册）</button>
          <button
            className="btn-primary"
            onClick={() => router.push(`/photos`, { scroll: false })}
          >
            前往完整列表页
          </button>
        </div>
      </div>
    </div>
  );
}
