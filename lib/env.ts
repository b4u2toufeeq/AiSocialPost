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
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL").default("http://localhost:3000"),
});

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY"),

  CLERK_WEBHOOK_SECRET: z.string().min(1, "CLERK_WEBHOOK_SECRET"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid Redis connection URL"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),

  // Encryption for stored tokens
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY must be at least 32 characters"),

  // OAuth credentials (optional — configure per platform)
  META_APP_ID: z.string().optional().default(""),
  META_APP_SECRET: z.string().optional().default(""),
  TWITTER_CLIENT_ID: z.string().optional().default(""),
  TWITTER_CLIENT_SECRET: z.string().optional().default(""),
  LINKEDIN_CLIENT_ID: z.string().optional().default(""),
  LINKEDIN_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  TIKTOK_CLIENT_KEY: z.string().optional().default(""),
  TIKTOK_CLIENT_SECRET: z.string().optional().default(""),
  PINTEREST_CLIENT_ID: z.string().optional().default(""),
  PINTEREST_CLIENT_SECRET: z.string().optional().default(""),
  DISCORD_CLIENT_ID: z.string().optional().default(""),
  DISCORD_CLIENT_SECRET: z.string().optional().default(""),
  SLACK_CLIENT_ID: z.string().optional().default(""),
  SLACK_CLIENT_SECRET: z.string().optional().default(""),

  // Inngest
  INNGEST_EVENT_KEY: z.string().optional().default(""),
});

const isServer = typeof window === "undefined";

const clientParsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
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
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
    TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
    PINTEREST_CLIENT_ID: process.env.PINTEREST_CLIENT_ID,
    PINTEREST_CLIENT_SECRET: process.env.PINTEREST_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
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
