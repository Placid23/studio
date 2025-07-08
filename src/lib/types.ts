export interface Movie {
  type: 'movie';
  id: string; // TMDB ID
  supabaseId?: any; // Supabase ID, if in library
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
}

export interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
  runtime: number; // in minutes
  summary: string;
  imageUrl?: string;
}

export interface Show {
  type: 'show';
  id: string; // TMDB ID
  supabaseId?: any; // Supabase ID, if in library
  title: string;
  year: number;
  genres: string[];
  rating: number;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  episodes?: Episode[];
  trailerUrl?: string; // YouTube embed URL
  cast?: string[];
}
