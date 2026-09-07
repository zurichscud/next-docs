export type Dictionary = {
  title: string;
  description: string;
  keywords: string;
  hello: string;
  goToDocs: string;
};
export const locales = ["en", "zh", "ja"]; // 支持的语言
export const defaultLocale = "en";
export function getDictionary(locale: string): Promise<Dictionary> {
  return import(`./${locale}.json`).then((module) => module.default);
}
