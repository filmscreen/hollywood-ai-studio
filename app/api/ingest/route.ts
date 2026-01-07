import { NextRequest, NextResponse } from "next/server";
import { insertNewsItem } from "@/lib/db";

export interface IngestData {
  category: "good" | "bad" | "controversial";
  headline: string;
  content: string;
  analysis: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestData = await request.json();

    // Validate required fields
    if (!body.category || !body.headline || !body.content || !body.analysis) {
      return NextResponse.json(
        { error: "Missing required fields: category, headline, content, and analysis are required" },
        { status: 400 }
      );
    }

    // Validate category
    if (!["good", "bad", "controversial"].includes(body.category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: good, bad, controversial" },
        { status: 400 }
      );
    }

    // Insert into database
    // Map API fields: content -> summary, analysis -> studio_take
    const newsItem = await insertNewsItem(
      body.category,
      body.headline,
      body.content, // Maps to summary in database
      body.analysis // Maps to studio_take in database
    );

    // Return data in dashboard format
    return NextResponse.json(
      {
        success: true,
        message: "Data ingested successfully",
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
    console.error("Error ingesting data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
