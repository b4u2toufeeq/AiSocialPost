import { auth } from "@clerk/nextjs/server";
import { PLATFORMS, getClientId, type PlatformId } from "@/services/oauth";
import { env } from "@/lib/env";
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

  const config = PLATFORMS.find((p) => p.id === platform);
  if (!config) {
    return Response.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
  }

  const clientId = getClientId(platform as PlatformId);
  if (!clientId) {
    return Response.json({
      error: `${config.name} OAuth is not configured. Set the required environment variables.`,
      missingConfig: true,
      platform: config.id,
    }, { status: 400 });
  }

  const state = crypto.randomBytes(32).toString("hex");
  const redirectUri = `${env.NEXT_PUBLIC_BASE_URL}/api/oauth/${platform}/callback`;
  const authUrl = config.connectUrl(redirectUri, state);

  return Response.json({ authUrl });
}
