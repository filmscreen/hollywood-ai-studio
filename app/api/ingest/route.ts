import { NextRequest, NextResponse } from "next/server";

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

    // Here you would typically save to a database
    // For now, we'll just return success
    // In a real implementation, you'd store this data and the dashboard would fetch it

    // Map API fields to dashboard format
    // API uses: content, analysis
    // Dashboard uses: summary, studioTake
    const mappedData = {
      id: Date.now().toString(),
      category: body.category,
      headline: body.headline,
      summary: body.content, // Map content to summary
      studioTake: body.analysis, // Map analysis to studioTake
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Data ingested successfully",
        data: mappedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error ingesting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
