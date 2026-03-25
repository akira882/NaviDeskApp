import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { answerGuideAsync } from "@/lib/ai/guide-service";
import { buildInitialStateForRole } from "@/lib/server/initial-state";
import { getSessionRole } from "@/lib/server/session";
import { categoryRepository } from "@/data/repositories/content-repository";
import { roles } from "@/types/domain";

/**
 * AI Guide API Route
 *
 * This route handles AI-guided Q&A requests using internal content as context.
 * It enforces server-side execution to protect AWS credentials and other sensitive data.
 *
 * Security boundaries:
 * - AWS credentials never exposed to client
 * - Role-based content filtering applied server-side
 * - Input validation with Zod
 */

const requestSchema = z.object({
  question: z.string().min(1).max(500),
  role: z.enum(roles).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request: " + validation.error.message },
        { status: 400 }
      );
    }

    const { question, role: requestRole } = validation.data;

    // Use session role or fall back to request role (for development)
    const role = requestRole ?? getSessionRole();

    // Build role-appropriate content state server-side
    const state = buildInitialStateForRole(role);
    const categories = categoryRepository.list();

    // Call AI guide service with server-side provider
    const response = await answerGuideAsync({
      question,
      role,
      state,
      categories
    });

    return NextResponse.json(response);
  } catch (error) {
    // Log error server-side (in production, use proper logging service)
    console.error("AI Guide API error:", error);

    // Return fallback response without exposing internal error details
    return NextResponse.json(
      {
        mode: "fallback",
        message: "AI案内の取得中にエラーが発生しました。通常の検索をお試しください。",
        suggestions: []
      },
      { status: 500 }
    );
  }
}
