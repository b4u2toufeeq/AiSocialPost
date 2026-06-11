import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Generates an engaging social media post caption based on a given context/prompt.
 */
export async function generateCaption(context: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an expert social media manager. Create an engaging, high-performing social media post caption based on the following context, topics, or instructions:
"${context}"

Include relevant, tasteful hashtags if appropriate. Return ONLY the final caption text. Do not include any other markdown intro, outro, quotes or conversational filler.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating caption with Gemini:", error);
    throw new Error("Failed to generate caption");
  }
}

/**
 * Generates an automated assistant reply to a user's comment.
 */
export async function generateAutoReply(comment: string, context: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a friendly, helpful social media brand representative. Generate a response to the following comment.

Post Content / Context:
"${context}"

User Comment:
"${comment}"

Write a polite, conversational, and brief response (max 2 sentences). Return ONLY the response text. Do not add quotes, titles, or intro/outro comments.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating auto-reply with Gemini:", error);
    throw new Error("Failed to generate auto-reply");
  }
}
