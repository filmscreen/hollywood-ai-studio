# Hollywood AI Studio - Newsletter Dashboard

A professional, dark-mode newsletter dashboard for curating Hollywood AI content with a cinematic 3-column layout.

## Features

- **3-Column Layout**: "The Good" (Innovation), "The Bad" (Industry Risks), "The Controversial" (Ethics/Legal)
- **News Cards**: Each card displays Headline, Summary, and Studio Take
- **Approve System**: Move cards to the Weekly Issue Preview section
- **Luxe Design**: Dark mode with slate-950 backgrounds, thin silver borders, and professional typography
- **API Endpoint**: POST endpoint at `/api/ingest` to receive data from AI agents

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect to `/dashboard`.

## API Usage

### POST `/api/ingest`

Receive JSON data from your AI agent.

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
    "id": "1234567890",
    "category": "good",
    "headline": "AI Revolutionizes Film Production",
    "content": "New AI tools are transforming how movies are made...",
    "analysis": "This represents a significant shift in the industry...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Data Storage

Currently, the dashboard uses browser localStorage to persist data. In a production environment, you would want to:

1. Store ingested data in a database (PostgreSQL, MongoDB, etc.)
2. Fetch data from the database when the dashboard loads
3. Implement proper authentication and authorization

## Project Structure

```
hollywood-ai-studio/
├── app/
│   ├── api/
│   │   └── ingest/
│   │       └── route.ts      # API endpoint for ingesting data
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (redirects to dashboard)
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

## Next Steps

1. Connect to a database for persistent storage
2. Add authentication
3. Implement real-time updates (WebSockets or Server-Sent Events)
4. Add export functionality for the weekly issue
5. Implement search and filtering
6. Add drag-and-drop reordering
