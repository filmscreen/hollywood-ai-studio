-- Database schema for Hollywood AI Studio Newsletter Dashboard
-- Run this SQL in your Neon Postgres database to create the news_items table

CREATE TABLE IF NOT EXISTS news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(20) NOT NULL CHECK (category IN ('good', 'bad', 'controversial')),
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  studio_take TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on category for faster queries
CREATE INDEX IF NOT EXISTS idx_news_items_category ON news_items(category);

-- Create an index on is_approved for faster filtering
CREATE INDEX IF NOT EXISTS idx_news_items_approved ON news_items(is_approved);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_news_items_created_at ON news_items(created_at DESC);
