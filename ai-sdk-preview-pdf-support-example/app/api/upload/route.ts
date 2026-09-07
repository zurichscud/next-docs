import { uploadPdfToOss } from "@/lib/oss";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (
      typeof body?.data !== "string" ||
      typeof body?.name !== "string" ||
      body.name.length === 0
    ) {
      return Response.json({ error: "A PDF file is required" }, { status: 400 });
    }

    const url = await uploadPdfToOss(body.data, body.name);
    return Response.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
