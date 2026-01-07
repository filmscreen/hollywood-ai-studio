import { NextResponse } from "next/server";
import { getAllNewsItems } from "@/lib/db";

// Mock data fallback for when database is unavailable
function getMockNewsItems() {
  return [
    {
      id: "mock-1",
      category: "good" as const,
      headline: "AI-Powered Script Analysis Revolutionizes Hollywood Development",
      summary: "Major studios are adopting AI tools to analyze scripts, predict box office performance, and optimize story structures. This technology is helping writers refine their work and studios make more informed greenlight decisions.",
      studioTake: "This represents a significant shift toward data-driven creative decisions. While some fear it may homogenize storytelling, early results show it can help identify unique voices that might otherwise be overlooked.",
      isApproved: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: "mock-2",
      category: "bad" as const,
      headline: "Deepfake Technology Raises Concerns About Actor Rights and Consent",
      summary: "Recent incidents of unauthorized deepfake usage have sparked debates about actor rights, consent, and the future of performance capture. Industry unions are calling for stricter regulations.",
      studioTake: "This is a critical issue that needs immediate attention. We need clear legal frameworks to protect performers while allowing legitimate uses of AI in filmmaking. The industry must act before public trust erodes further.",
      isApproved: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: "mock-3",
      category: "controversial" as const,
      headline: "Writers Guild Demands AI Disclosure Requirements in New Contracts",
      summary: "The WGA is pushing for mandatory disclosure when AI tools are used in script development, raising questions about credit, compensation, and the definition of authorship in the AI era.",
      studioTake: "This negotiation will set precedents for years to come. Both sides need to balance protecting creative workers with allowing innovation. The outcome will shape how AI is integrated into the creative process.",
      isApproved: false,
      timestamp: new Date().toISOString(),
    },
  ];
}

export async function GET() {
  try {
    // Check if POSTGRES_URL is available
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      console.warn("POSTGRES_URL not found, returning mock data");
      return NextResponse.json(
        {
          success: true,
          data: getMockNewsItems(),
          warning: "Using mock data - database not configured",
        },
        { status: 200 }
      );
    }

    // Try to fetch from database
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
    } catch (dbError) {
      // Database connection or query failed - return mock data as fallback
      console.error("Database error, falling back to mock data:", dbError);
      return NextResponse.json(
        {
          success: true,
          data: getMockNewsItems(),
          warning: "Database unavailable - using mock data",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    // Last resort fallback - return mock data even if something else fails
    console.error("Unexpected error in GET /api/news-items:", error);
    return NextResponse.json(
      {
        success: true,
        data: getMockNewsItems(),
        warning: "Service error - using mock data",
      },
      { status: 200 }
    );
  }
}
