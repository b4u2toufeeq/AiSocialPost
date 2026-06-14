import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { imagekit } from "@/services/imagekit";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";

const AI_TRANSFORMATIONS = [
  { id: "enhance", label: "Enhance", description: "Auto-enhance image quality" },
  { id: "background_removal", label: "Remove Background", description: "Remove image background" },
  { id: "colorize", label: "Colorize", description: "Colorize black & white images" },
  { id: "upscale", label: "Upscale", description: "2x AI upscaling" },
  { id: "generative_fill", label: "Generative Fill", description: "AI fill & expand" },
  { id: "remove_text", label: "Remove Text", description: "AI text removal" },
];

export type AITransformationType = (typeof AI_TRANSFORMATIONS)[number]["id"];

const TRANSFORM_MAP: Record<AITransformationType, string> = {
  enhance: "e-improve",
  background_removal: "e-background_removal",
  colorize: "e-colorize",
  upscale: "w-1024,h-1024",
  generative_fill: "e-generative-fill",
  remove_text: "e-remove-text",
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileId, transformation, prompt } = body as {
      fileId: string;
      transformation: AITransformationType;
      prompt?: string;
    };

    if (!fileId || !transformation) {
      return NextResponse.json(
        { error: "fileId and transformation are required" },
        { status: 400 }
      );
    }

    if (!TRANSFORM_MAP[transformation]) {
      return NextResponse.json(
        { error: `Unknown transformation: ${transformation}` },
        { status: 400 }
      );
    }

    if (transformation === "generative_fill" && !prompt) {
      return NextResponse.json(
        { error: "Prompt is required for generative fill" },
        { status: 400 }
      );
    }

    const asset = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.fileId, fileId))
      .then((r) => r[0]);

    if (!asset) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const rawTransform = TRANSFORM_MAP[transformation] +
      (transformation === "generative_fill" && prompt
        ? `:${encodeURIComponent(prompt)}`
        : "");

    const transformedUrl = imagekit.url({
      src: asset.url,
      transformation: [{ raw: rawTransform }],
    });

    const result = await imagekit.upload({
      file: transformedUrl,
      fileName: `transformed_${fileId}_${transformation}`,
      folder: `/social-copilot/${userId}/transformations`,
    });

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      thumbnailUrl: result.thumbnailUrl,
      transformation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Transformation failed";
    console.error("Image transformation error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export { AI_TRANSFORMATIONS };
