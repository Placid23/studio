-- Create a table for liked songs
CREATE TABLE liked_songs (
  id BIGINT PRIMARY KEY, -- Use the Deezer track ID as the primary key
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  preview_url TEXT,
  artist_name TEXT NOT NULL,
  album_title TEXT NOT NULL,
  album_cover_url TEXT,
  liked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent a user from liking the same song twice
  UNIQUE(id, user_id)
);

-- Enable Row Level Security
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see and manage their own liked songs
CREATE POLICY "Users can manage their own liked songs"
ON liked_songs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
