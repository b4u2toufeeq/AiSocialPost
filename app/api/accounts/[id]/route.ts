import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { socialAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const deleted = await db
    .delete(socialAccounts)
    .where(and(eq(socialAccounts.id, id), eq(socialAccounts.userId, userId)))
    .returning({ id: socialAccounts.id });

  if (deleted.length === 0) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
