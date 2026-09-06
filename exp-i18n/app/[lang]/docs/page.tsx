import { notFound } from "next/navigation";
import { locales, getDictionary } from "@/locale";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const dict = await getDictionary(lang);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">{dict.title}</h1>
      <p className="text-lg text-zinc-600">{dict.description}</p>
    </main>
  );
}
