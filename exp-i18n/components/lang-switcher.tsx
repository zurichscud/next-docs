"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/locale";

const labels: Record<string, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
};

export default function LangSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const current = segments[0];
  const rest = segments.slice(1).join("/");

  return (
    <nav className="flex gap-2 text-sm">
      {/* 需要实现高亮当前语言 */}
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${rest ? `/${rest}` : ""}`}
          className={`rounded-full border px-4 py-1.5 transition-colors ${
            locale === current
              ? "border-foreground bg-foreground text-background"
              : "border-black/[.08] hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          }`}
        >
          {labels[locale]}
        </Link>
      ))}
    </nav>
  );
}
