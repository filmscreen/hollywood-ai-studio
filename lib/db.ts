import { sql } from "@vercel/postgres";

export interface NewsItem {
  id: string;
  category: "good" | "bad" | "controversial";
  headline: string;
  summary: string;
  studio_take: string;
  is_approved: boolean;
  created_at: string;
}

// Check if POSTGRES_URL is available
function checkDatabaseConnection(): boolean {
  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    console.warn("POSTGRES_URL environment variable is not set");
    return false;
  }
  return true;
}

// Initialize the database schema - creates table if it doesn't exist
export async function ensureTableExists(): Promise<boolean> {
  try {
    if (!checkDatabaseConnection()) {
      return false;
    }

    await sql`
      CREATE TABLE IF NOT EXISTS news_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category VARCHAR(20) NOT NULL CHECK (category IN ('good', 'bad', 'controversial')),
        headline TEXT NOT NULL,
        summary TEXT NOT NULL,
        studio_take TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create indexes if they don't exist
    await sql`
      CREATE INDEX IF NOT EXISTS idx_news_items_category ON news_items(category);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_news_items_approved ON news_items(is_approved);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON news_items(created_at DESC);
    `;
    
    console.log("Database schema ensured successfully");
    return true;
  } catch (error) {
    console.error("Error ensuring database table exists:", error);
    return false;
  }
}

// Initialize the database schema (legacy function for backwards compatibility)
export async function initializeDatabase() {
  return await ensureTableExists();
}

// Get all news items with automatic table creation
export async function getAllNewsItems(): Promise<NewsItem[]> {
  try {
    // Ensure table exists before querying
    const tableExists = await ensureTableExists();
    if (!tableExists) {
      throw new Error("Database connection failed or table could not be created");
    }

    const result = await sql<NewsItem>`
      SELECT 
        id::text as id,
        category,
        headline,
        summary,
        studio_take,
        is_approved,
        created_at::text as created_at
      FROM news_items
      ORDER BY created_at DESC;
    `;
    return result.rows;
  } catch (error) {
    console.error("Error fetching news items:", error);
    throw error;
  }
}

// Get news items by approval status
export async function getNewsItemsByApproval(approved: boolean): Promise<NewsItem[]> {
  try {
    const result = await sql<NewsItem>`
      SELECT 
        id::text as id,
        category,
        headline,
        summary,
        studio_take,
        is_approved,
        created_at::text as created_at
      FROM news_items
      WHERE is_approved = ${approved}
      ORDER BY created_at DESC;
    `;
    return result.rows;
  } catch (error) {
    console.error("Error fetching news items by approval:", error);
    throw error;
  }
}

// Insert a new news item with automatic table creation
export async function insertNewsItem(
  category: "good" | "bad" | "controversial",
  headline: string,
  summary: string,
  studioTake: string
): Promise<NewsItem> {
  try {
    // Ensure table exists before inserting
    const tableExists = await ensureTableExists();
    if (!tableExists) {
      throw new Error("Database connection failed or table could not be created");
    }

    const result = await sql<NewsItem>`
      INSERT INTO news_items (category, headline, summary, studio_take, is_approved)
      VALUES (${category}, ${headline}, ${summary}, ${studioTake}, FALSE)
      RETURNING 
        id::text as id,
        category,
        headline,
        summary,
        studio_take,
        is_approved,
        created_at::text as created_at;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting news item:", error);
    throw error;
  }
}

// Update approval status with automatic table creation
export async function updateApprovalStatus(id: string, isApproved: boolean): Promise<NewsItem> {
  try {
    // Ensure table exists before updating
    const tableExists = await ensureTableExists();
    if (!tableExists) {
      throw new Error("Database connection failed or table could not be created");
    }

    const result = await sql<NewsItem>`
      UPDATE news_items
      SET is_approved = ${isApproved}
      WHERE id::text = ${id}
      RETURNING 
        id::text as id,
        category,
        headline,
        summary,
        studio_take,
        is_approved,
        created_at::text as created_at;
    `;
    if (result.rows.length === 0) {
      throw new Error("News item not found");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error updating approval status:", error);
    throw error;
  }
}
