import OSS from "ali-oss";

const getOssClient = () => {
  const { OSS_REGION, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET } =
    process.env;

  if (!OSS_REGION || !OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET || !OSS_BUCKET) {
    throw new Error(
      "OSS_REGION, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET and OSS_BUCKET are required",
    );
  }

  return new OSS({
    region: OSS_REGION,
    accessKeyId: OSS_ACCESS_KEY_ID,
    accessKeySecret: OSS_ACCESS_KEY_SECRET,
    bucket: OSS_BUCKET,
    secure: true,
  });
};

export async function uploadPdfToOss(
  dataUrl: string,
  fileName: string,
): Promise<string> {
  const match = dataUrl.match(/^data:application\/pdf;base64,(.+)$/);
  if (!match) {
    throw new Error("Only base64 encoded PDF files are supported");
  }

  const buffer = Buffer.from(match[1], "base64");
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("PDF files must be 5MB or smaller");
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `quiz-pdfs/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
  const client = getOssClient();
  await client.put(objectKey, buffer, {
    mime: "application/pdf",
  });

  const publicBaseUrl = process.env.OSS_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${objectKey}`;
  }

  return client.signatureUrl(objectKey, {
    expires: Number(process.env.OSS_URL_EXPIRES ?? 3600),
  });
}
