import { questionSchema, questionsSchema } from "@/lib/schemas";
import { deepseek } from "@/lib/deepseek";
import { extractText } from "unpdf";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { files } = await req.json();
    const documentUrl = files?.[0]?.url;
    if (typeof documentUrl !== "string") {
      return Response.json(
        { error: "An uploaded PDF URL is required" },
        { status: 400 },
      );
    }

    const parsedUrl = new URL(documentUrl);
    const configuredBaseUrl = process.env.OSS_PUBLIC_BASE_URL;
    const expectedHost = configuredBaseUrl
      ? new URL(configuredBaseUrl).host
      : `${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com`;
    if (parsedUrl.protocol !== "https:" || parsedUrl.host !== expectedHost) {
      return Response.json(
        { error: "The PDF URL is not a trusted OSS URL" },
        { status: 400 },
      );
    }

    const documentResponse = await fetch(documentUrl);
    if (!documentResponse.ok) {
      return Response.json(
        { error: "Unable to read the uploaded PDF" },
        { status: 400 },
      );
    }
    const document = await extractText(
      new Uint8Array(await documentResponse.arrayBuffer()),
      { mergePages: true },
    );
    const documentText = document.text.slice(0, 120_000);

    const result = streamObject({
      model: deepseek("deepseek-v4-flash"),
      mode: "json",
      messages: [
        {
          role: "system",
          content:
            "You are a teacher. Your job is to take a document, and create a multiple choice test (with 4 questions) based on the content of the document. Each option should be roughly equal in length.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Create a multiple choice test based on this document.",
            },
            {
              type: "text",
              text: `PDF URL (uploaded to Aliyun OSS): ${documentUrl}\n\nPDF content:\n${documentText}`,
            },
          ],
        },
      ],
      schema: questionSchema,
      output: "array",
      onFinish: ({ object }) => {
        const res = questionsSchema.safeParse(object);
        if (res.error) {
          throw new Error(res.error.errors.map((e) => e.message).join("\n"));
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Quiz generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
