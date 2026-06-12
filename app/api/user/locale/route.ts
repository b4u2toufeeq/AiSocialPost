import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locale } = await req.json();
  if (locale !== "en" && locale !== "ar") {
    return Response.json({ error: "Invalid locale" }, { status: 400 });
  }

  const result = await db
    .insert(users)
    .values({ id: userId, email: "", locale, updatedAt: new Date() })
    .onConflictDoUpdate({ target: users.id, set: { locale, updatedAt: new Date() } });

  return Response.json({ success: true });
}
