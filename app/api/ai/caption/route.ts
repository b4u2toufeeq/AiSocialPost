import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, platforms } = body as { prompt: string; platforms?: string[] };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const platformContext = platforms?.length
      ? `Target platforms: ${platforms.join(", ")}`
      : "";

    const systemPrompt = `You are an expert social media manager. Generate 3 distinct caption variants for the following content. Each variant should have a different tone or angle.

${platformContext}

Context: "${prompt}"

For each variant include relevant hashtags. Return the response as a JSON array of objects with keys "title" (short label like "Professional", "Casual", "Promotional") and "text" (full caption with hashtags). Return ONLY the JSON array, no markdown or other text.`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().trim();

    let captions: { title: string; text: string }[];
    try {
      captions = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      captions = [
        { title: "Variant 1", text },
        { title: "Variant 2", text },
        { title: "Variant 3", text },
      ];
    }

    return NextResponse.json({ captions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate caption";
    console.error("AI caption generation error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
