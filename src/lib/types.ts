




export interface Movie {
  type: 'movie';
  tmdbId: string; // TMDB ID
  supabaseId?: any; // Supabase auto-generated ID, if in library
  title: string;
  year: number;
  duration?: number; // in minutes
  genres: string[];
  rating: number;
  synopsis: string | null;
  cast?: string[];
  director?: string;
  posterUrl: string | null;
  backdropUrl:string | null;
  trailerUrl?: string; // YouTube embed URL
  file_id?: string; // Path to video file in Supabase Storage
}

export interface Episode {
  id: string;
  name: string;
  season_number: number;
  episode_number: number;
  synopsis: string | null;
  still_path: string | null;
}

export interface Season {
  id: string;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
}

export interface Show {
  type: 'tv' | 'anime';
  tmdbId: string; // TMDB ID
  supabaseId?: any; // Supabase auto-generated ID, if in library
  title: string;
  year: number;
  genres: string[];
  rating: number;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl?: string; // YouTube embed URL
  cast?: string[];
  seasons?: Season[];
  file_id?: string; // Path to video file in Supabase Storage
}

// Music Types
export interface Album {
  id: number;
  title: string;
  cover_xl: string;
  link: string;
  artist: {
    id: number;
    name: string;
    picture_xl: string;
  };
  release_date: string;
  tracks: {
    data: Track[];
  }
}

export interface Artist {
    id: number;
    name: string;
    picture_xl: string;
    nb_fan: number;
}

export interface Track {
    id: number;
    title: string;
    duration: number;
    preview: string;
    artist: {
        name: string;
    };
    album: {
        id: number;
        title: string;
        cover_xl: string;
    };
    type?: 'track';
}

export interface LikedSong extends Track {
    likedAt: number;
}
