# Hollywood AI Studio - Newsletter Dashboard

A professional, dark-mode newsletter dashboard for curating Hollywood AI content with a cinematic 3-column layout.

## Features

- **3-Column Layout**: "The Good" (Innovation), "The Bad" (Industry Risks), "The Controversial" (Ethics/Legal)
- **News Cards**: Each card displays Headline, Summary, and Studio Take
- **Approve System**: Move cards to the Weekly Issue Preview section with persistent database storage
- **Luxe Design**: Dark mode with slate-950 backgrounds, thin silver borders, and professional typography
- **API Endpoint**: POST endpoint at `/api/ingest` to receive data from AI agents
- **Database Integration**: Neon Postgres (Vercel Postgres) for persistent storage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon Postgres database (or Vercel Postgres)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database:
   - Create a Neon Postgres database (or use Vercel Postgres)
   - Run the SQL schema from `schema.sql` in your database
   - Set up environment variables (see below)

3. Configure environment variables:
   Create a `.env.local` file in the root directory:
```env
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_connection_string
```

   If using Vercel Postgres, these variables are automatically set when you connect the database in the Vercel dashboard.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect to `/dashboard`.

## Database Setup

1. **Create the table**: Run the SQL in `schema.sql` in your Neon Postgres database:
```sql
CREATE TABLE IF NOT EXISTS news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(20) NOT NULL CHECK (category IN ('good', 'bad', 'controversial')),
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  studio_take TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

2. **Add indexes** (optional but recommended):
```sql
CREATE INDEX IF NOT EXISTS idx_news_items_category ON news_items(category);
CREATE INDEX IF NOT EXISTS idx_news_items_approved ON news_items(is_approved);
CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON news_items(created_at DESC);
```

## API Usage

### POST `/api/ingest`

Receive JSON data from your AI agent and store it in the database.

**Request Body:**
```json
{
  "category": "good" | "bad" | "controversial",
  "headline": "Article headline",
  "content": "Article content/summary",
  "analysis": "Studio analysis/take"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "category": "good",
    "headline": "AI Revolutionizes Film Production",
    "content": "New AI tools are transforming how movies are made...",
    "analysis": "This represents a significant shift in the industry..."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Data ingested successfully",
  "data": {
    "id": "uuid-here",
    "category": "good",
    "headline": "AI Revolutionizes Film Production",
    "summary": "New AI tools are transforming how movies are made...",
    "studioTake": "This represents a significant shift in the industry...",
    "isApproved": false,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/news-items`

Fetch all news items from the database.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "category": "good",
      "headline": "...",
      "summary": "...",
      "studioTake": "...",
      "isApproved": false,
      "timestamp": "..."
    }
  ]
}
```

### PATCH `/api/news-items/[id]/approve`

Update the approval status of a news item.

**Request Body:**
```json
{
  "isApproved": true
}
```

## Project Structure

```
hollywood-ai-studio/
├── app/
│   ├── api/
│   │   ├── ingest/
│   │   │   └── route.ts              # API endpoint for ingesting data
│   │   └── news-items/
│   │       ├── route.ts               # GET all news items
│   │       └── [id]/
│   │           └── approve/
│   │               └── route.ts       # PATCH approval status
│   ├── dashboard/
│   │   └── page.tsx                   # Main dashboard page
│   ├── globals.css                    # Global styles
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Home page (redirects to dashboard)
├── lib/
│   └── db.ts                          # Database utility functions
├── schema.sql                         # Database schema
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Design System

- **Background**: `slate-950` (darkest slate)
- **Borders**: Thin silver borders with opacity (`border-slate-800/50`, `border-slate-700/50`)
- **Typography**: Professional, clean fonts with proper hierarchy
- **Accent Colors**:
  - The Good: Emerald (`emerald-400`, `emerald-500/30`)
  - The Bad: Red (`red-400`, `red-500/30`)
  - The Controversial: Amber (`amber-400`, `amber-500/30`)

## Database Schema

The `news_items` table has the following structure:

- `id` (UUID): Primary key, auto-generated
- `category` (VARCHAR): One of 'good', 'bad', or 'controversial'
- `headline` (TEXT): Article headline
- `summary` (TEXT): Article summary/content
- `studio_take` (TEXT): Studio analysis/take
- `is_approved` (BOOLEAN): Whether the item is approved for the newsletter
- `created_at` (TIMESTAMP): When the item was created

## Next Steps

1. Add authentication and authorization
2. Implement real-time updates (WebSockets or Server-Sent Events)
3. Add search and filtering capabilities
4. Implement drag-and-drop reordering
5. Add export functionality for different newsletter formats
6. Add analytics and tracking
