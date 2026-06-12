import { auth } from "@clerk/nextjs/server";
import { resolveCredentials, getAdapter, PLATFORM_META, type PlatformId } from "@/services/providers";
import crypto from "crypto";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await params;

  if (platform === "telegram") {
    return Response.json({
      requiresManualToken: true,
      message: "Telegram uses a bot token. Please enter your bot token manually.",
    });
  }

  const adapter = getAdapter(platform as PlatformId);
  const meta = PLATFORM_META[platform as PlatformId];

  if (!adapter || !meta) {
    return Response.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
  }

  const { config, credentials } = await resolveCredentials(userId, platform as PlatformId);

  if (!credentials) {
    return Response.json({
      error: `${meta.name} is not configured. Please configure API credentials first.`,
      missingConfig: true,
      platform,
    }, { status: 400 });
  }

  const state = crypto.randomBytes(32).toString("hex");
  const authUrl = adapter.connectUrl(credentials, state);

  return Response.json({
    authUrl,
    providerConfigId: config?.id ?? null,
    state,
  });
}
