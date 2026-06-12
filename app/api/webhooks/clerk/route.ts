import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the payload body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Webhook signature verification failed:", err);
    return new Response("Error: Invalid signature", {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log("=== WEBHOOK EVENT ===", eventType);

  const upsertUser = async (userData: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  }) => {
    console.log("=== INSERTING USER ===", userData.id, userData.email);
    await db
      .insert(users)
      .values({ ...userData, createdAt: new Date(), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userData, updatedAt: new Date() },
      });
    console.log("=== USER INSERTED SUCCESSFULLY ===");
  };

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    if (!id || !email) {
      return new Response("Error: Missing required user parameters", { status: 400 });
    }
    await upsertUser({
      id,
      email,
      firstName: first_name || null,
      lastName: last_name || null,
      imageUrl: image_url || null,
    });
  } else if (eventType === "session.created") {
    const u = evt.data.user;
    if (!u?.id) {
      return new Response("Error: Missing user in session data", { status: 400 });
    }
    const email = u.email_addresses?.[0]?.email_address;
    if (!email) {
      return new Response("Error: Missing email in session user data", { status: 400 });
    }
    await upsertUser({
      id: u.id,
      email,
      firstName: u.first_name || null,
      lastName: u.last_name || null,
      imageUrl: u.image_url || null,
    });
  } else if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (!id) {
      return new Response("Error: Missing user ID for deletion", {
        status: 400,
      });
    }
    await db.delete(users).where(eq(users.id, id));
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
