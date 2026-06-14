import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { imagekit } from "@/services/imagekit";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${userId}_${Date.now()}_${file.name}`;

    const uploadResult = await imagekit.upload({
      file: buffer,
      fileName,
      folder: `/social-copilot/${userId}`,
    });

    await db.insert(mediaAssets).values({
      userId,
      fileName: file.name,
      fileType: file.type,
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      width: uploadResult.width?.toString(),
      height: uploadResult.height?.toString(),
      fileSize: uploadResult.size?.toString(),
    });

    return NextResponse.json({
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      thumbnailUrl: uploadResult.thumbnailUrl,
      width: uploadResult.width,
      height: uploadResult.height,
      fileSize: uploadResult.size,
      name: file.name,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
