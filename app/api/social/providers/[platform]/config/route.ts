import { auth } from "@clerk/nextjs/server";
import { resolveCredentials, PLATFORM_META, getAdapter, type PlatformId } from "@/services/providers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await params;
  const adapter = getAdapter(platform as PlatformId);
  const meta = PLATFORM_META[platform as PlatformId];

  if (!adapter || !meta) {
    return Response.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
  }

  const { config, credentials } = await resolveCredentials(userId, platform as PlatformId);

  return Response.json({
    platform,
    name: meta.name,
    hasConfig: !!config,
    hasSystemCredentials: !!credentials,
    providerType: config?.providerType ?? (credentials ? "system" : null),
    config: config
      ? {
          id: config.id,
          providerType: config.providerType,
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          scopes: config.scopes,
          isActive: config.isActive,
          createdAt: config.createdAt,
        }
      : null,
  });
}
