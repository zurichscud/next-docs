"use server";

import { deepseek } from "@/lib/deepseek";
import { generateObject } from "ai";
import { z } from "zod";
/**
 * 根据上传的 PDF 文件名生成一个测验标题（quiz title）。
 * @param file
 * @returns
 */
export const generateQuizTitle = async (file: string) => {
  const result = await generateObject({
    model: deepseek("deepseek-v4-flash"),
    mode: "json",
    schema: z.object({
      title: z
        .string()
        .describe(
          "A max three word title for the quiz based on the file provided as context",
        ),
    }),
    prompt:
      "Generate a title for a quiz based on the following (PDF) file name. Try and extract as much info from the file name as possible. If the file name is just numbers or incoherent, just return quiz.\n\n " +
      file,
  });
  return result.object.title;
};
