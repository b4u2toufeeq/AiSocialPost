import { NextResponse } from "next/server";
import { imagekit } from "@/services/imagekit";

export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    console.error("Failed to generate ImageKit authentication parameters:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate authentication parameters" },
      { status: 500 }
    );
  }
}
