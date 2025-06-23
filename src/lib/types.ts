export interface Movie {
  type: 'movie';
  id: string;
  supabaseId?: any;
  title: string;
  year: number;
  duration?: number; // in minutes
  genres: string[];
  genre_ids?: number[];
  rating: number;
  synopsis: string | null;
  cast?: string[];
  director?: string;
  posterUrl: string | null;
  backdropUrl:string | null;
  trailerUrl?: string;
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
  id: string;
  supabaseId?: any;
  title: string;
  year: number;
  genres: string[];
  rating: number;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  episodes?: Episode[];
  trailerUrl?: string;
  cast?: string[];
}
