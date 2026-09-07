# AI SDK PDF Support Example

This example demonstrates how to use the [AI SDK](https://sdk.vercel.ai/docs) with [Next.js](https://nextjs.org/) to upload PDFs to Aliyun OSS and generate quizzes with DeepSeek.

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-preview-pdf-support&env=DEEPSEEK_API_KEY&envDescription=DeepSeek%20API%20key%20needed%20for%20application&envLink=deepseek.com)

## How to use

Run [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/vercel-labs/ai-sdk-preview-pdf-support ai-sdk-preview-pdf-support-example
```

```bash
yarn create next-app --example https://github.com/vercel-labs/ai-sdk-preview-pdf-support ai-sdk-preview-pdf-support-example
```

```bash
pnpm create next-app --example https://github.com/vercel-labs/ai-sdk-preview-pdf-support ai-sdk-preview-pdf-support-example
```

To run the example locally you need to:

1. Obtain a DeepSeek API key and Aliyun OSS credentials.
2. Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   DEEPSEEK_API_KEY=your-deepseek-api-key
   OSS_REGION=oss-cn-hangzhou
   OSS_ACCESS_KEY_ID=your-access-key-id
   OSS_ACCESS_KEY_SECRET=your-access-key-secret
   OSS_BUCKET=your-bucket-name
   # Optional: public CDN/bucket URL. Without it, a signed URL is generated.
   OSS_PUBLIC_BASE_URL=https://your-bucket.oss-cn-hangzhou.aliyuncs.com
   ```

3. Make sure the OSS bucket allows access using the generated URL (public read or a valid signed URL).
4. `npm install` to install the required dependencies.
5. `npm run dev` to launch the development server.


## Learn More

To learn more about Vercel AI SDK or Next.js take a look at the following resources:

- [AI SDK docs](https://sdk.vercel.ai/docs)
- [Vercel AI Playground](https://play.vercel.ai)
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
