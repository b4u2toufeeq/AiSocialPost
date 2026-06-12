import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { socialProviderConfigs, auditLogs } from "@/db/schema";
import { encrypt } from "@/lib/crypto";
import { getAdapter, PLATFORM_META, type PlatformId } from "@/services/providers";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const saveConfigSchema = z.object({
  platform: z.string().min(1),
  providerType: z.enum(["system", "custom"]),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  redirectUri: z.string().url(),
  scopes: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = saveConfigSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { platform, providerType, clientId, clientSecret, redirectUri, scopes } = parsed.data;

  const adapter = getAdapter(platform as PlatformId);
  if (!adapter) {
    return Response.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
  }

  // Encrypt client secret before storing
  const encryptedSecret = encrypt(clientSecret);

  // Upsert: delete existing active configs for this tenant + platform, then insert
  await db
    .delete(socialProviderConfigs)
    .where(
      and(
        eq(socialProviderConfigs.tenantId, userId),
        eq(socialProviderConfigs.platform, platform),
      ),
    );

  const [saved] = await db
    .insert(socialProviderConfigs)
    .values({
      tenantId: userId,
      platform,
      providerType,
      clientId,
      clientSecretEncrypted: encryptedSecret,
      redirectUri,
      scopes,
      isActive: true,
    })
    .returning({ id: socialProviderConfigs.id, createdAt: socialProviderConfigs.createdAt });

  // Audit log
  await db.insert(auditLogs).values({
    tenantId: userId,
    action: "provider_config.created",
    resource: "social_provider_configs",
    resourceId: saved.id,
    details: { platform, providerType },
  });

  const meta = PLATFORM_META[platform as PlatformId];
  return Response.json({
    id: saved.id,
    platform,
    name: meta?.name ?? platform,
    providerType,
    clientId,
    redirectUri,
    scopes,
    createdAt: saved.createdAt.toISOString(),
  });
}
