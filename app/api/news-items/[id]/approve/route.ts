import { NextRequest, NextResponse } from "next/server";
import { updateApprovalStatus } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isApproved } = body;

    if (typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "isApproved must be a boolean" },
        { status: 400 }
      );
    }

    const newsItem = await updateApprovalStatus(id, isApproved);

    // Transform database format to dashboard format
    return NextResponse.json(
      {
        success: true,
        data: {
          id: newsItem.id,
          category: newsItem.category,
          headline: newsItem.headline,
          summary: newsItem.summary,
          studioTake: newsItem.studio_take,
          isApproved: newsItem.is_approved,
          timestamp: newsItem.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating approval status:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
