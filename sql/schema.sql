-- Create the table only if it doesn't exist to prevent errors on re-run.
CREATE TABLE IF NOT EXISTS liked_songs (
  id BIGINT NOT NULL, -- The Deezer track ID
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  preview_url TEXT,
  artist_name TEXT NOT NULL,
  album_title TEXT NOT NULL,
  album_cover_url TEXT,
  liked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- A user can only like a song once.
  PRIMARY KEY(id, user_id)
);

-- Add the file_id column only if it doesn't already exist.
ALTER TABLE liked_songs
ADD COLUMN IF NOT EXISTS file_id TEXT;

-- Enable Row Level Security if it's not already enabled.
-- This is safe to run multiple times.
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists, to recreate it safely.
-- This handles cases where you might want to update the policy in the future.
DROP POLICY IF EXISTS "Users can manage their own liked songs" ON liked_songs;

-- Create policy to allow users to see and manage their own liked songs.
CREATE POLICY "Users can manage their own liked songs"
ON liked_songs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
