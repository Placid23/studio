-- Create a table for liked songs
CREATE TABLE liked_songs (
  id BIGINT NOT NULL, -- Use the Deezer track ID
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  preview_url TEXT,
  artist_name TEXT NOT NULL,
  album_title TEXT NOT NULL,
  album_cover_url TEXT,
  file_id TEXT, -- To store the path/ID to the full song in your bucket
  liked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent a user from liking the same song twice
  PRIMARY KEY(id, user_id)
);

-- Enable Row Level Security
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see and manage their own liked songs
CREATE POLICY "Users can manage their own liked songs"
ON liked_songs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create movies table
-- This is just an example, you may need to adjust it based on your actual data model
CREATE TABLE movies (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id INT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    poster_url TEXT,
    backdrop_url TEXT,
    rating REAL,
    year INT,
    genres TEXT[],
    synopsis TEXT,
    file_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Policies for movies table
CREATE POLICY "Users can view all movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Users can insert movies if they are authenticated" ON movies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create tv_episodes table
CREATE TABLE tv_episodes (
    id BIGSERIAL PRIMARY KEY,
    show_tmdb_id INT NOT NULL,
    title TEXT NOT NULL,
    season INT NOT NULL,
    episode INT NOT NULL,
    file_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(show_tmdb_id, season, episode)
);

ALTER TABLE tv_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all episodes" ON tv_episodes FOR SELECT USING (true);
CREATE POLICY "Users can insert episodes if they are authenticated" ON tv_episodes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
