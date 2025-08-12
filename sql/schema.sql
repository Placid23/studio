
-- This table stores songs that a user has "liked".
-- It's designed to mirror the data structure from the Deezer API's track object,
-- allowing for a seamless transition from local storage to a database-backed feature.

CREATE TABLE liked_songs (
  id BIGINT PRIMARY KEY, -- Deezer track ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  preview_url TEXT,
  artist_name TEXT NOT NULL,
  album_id BIGINT,
  album_title TEXT,
  album_cover_url TEXT,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensures a user can only like a song once
  UNIQUE (user_id, id)
);

-- RLS Policies for liked_songs table
-- 1. Enable RLS
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to select their own liked songs
CREATE POLICY "Users can select their own liked songs"
ON public.liked_songs
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Allow users to insert their own liked songs
CREATE POLICY "Users can insert their own liked songs"
ON public.liked_songs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own liked songs
CREATE POLICY "Users can delete their own liked songs"
ON public.liked_songs
FOR DELETE
USING (auth.uid() = user_id);
