import { z } from "zod";
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG9naWNhbC1sYWR5YnVnLTc3LmNsZXJrLmFjY291bnRzLmRldiQ
// CLERK_SECRET_KEY=sk_test_XdvI6kUI7wkXffqVzoRSwvdkz4E0zGiHetO99IiJJK

const clientEnvSchema = z.object({
  // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG9naWNhbC1sYWR5YnVnLTc3LmNsZXJrLmFjY291bnRzLmRldiQ
  // NEXT_PUBLIC_CLERK_SECRET_KEY=sk_test_XdvI6kUI7wkXffqVzoRSwvdkz4E0zGiHetO99IiJJK

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z.string().min(1, "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY is required"),
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT must be a valid URL"),
});

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY"),
  //  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG9naWNhbC1sYWR5YnVnLTc3LmNsZXJrLmFjY291bnRzLmRldiQ
  // CLERK_SECRET_KEY= 

  CLERK_WEBHOOK_SECRET: z.string().min(1, "CLERK_WEBHOOK_SECRET"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid Redis connection URL"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

const isServer = typeof window === "undefined";

const clientParsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

if (!clientParsed.success) {
  console.error("❌ Invalid client environment variables:", clientParsed.error.format());
  throw new Error("Invalid client environment variables");
}

let serverParsedData = {} as z.infer<typeof serverEnvSchema>;

if (isServer) {
  const serverParsed = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  });

  if (!serverParsed.success) {
    console.error("❌ Invalid server environment variables:", serverParsed.error.format());
    throw new Error("Invalid server environment variables");
  }
  serverParsedData = serverParsed.data;
}

export const env = {
  ...clientParsed.data,
  ...(isServer ? serverParsedData : {}),
} as z.infer<typeof clientEnvSchema> & z.infer<typeof serverEnvSchema>;
// Cast as both so we have full typing in both environments (client-side build will strip server-only logic, and runtime server checks ensure variables exist).
