import { NextResponse } from "next/server";
import { getAllNewsItems } from "@/lib/db";

export async function GET() {
  try {
    const newsItems = await getAllNewsItems();

    // Transform database format to dashboard format
    const transformed = newsItems.map((item) => ({
      id: item.id,
      category: item.category,
      headline: item.headline,
      summary: item.summary,
      studioTake: item.studio_take,
      isApproved: item.is_approved,
      timestamp: item.created_at,
    }));

    return NextResponse.json(
      {
        success: true,
        data: transformed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching news items:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
