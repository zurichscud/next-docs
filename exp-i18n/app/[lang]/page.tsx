import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, getDictionary } from "@/locale";
import LangSwitcher from "@/components/lang-switcher";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-semibold">{dict.hello}</h1>
      <Link
        href={`/${lang}/docs`}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        {dict.goToDocs}
      </Link>
      <LangSwitcher />
    </main>
  );
}
