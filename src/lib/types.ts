export interface Movie {
  type: 'movie';
  id: string;
  title: string;
  year: number;
  duration?: number; // in minutes
  genres: string[];
  genre_ids?: number[];
  rating: number;
  synopsis: string;
  cast?: string[];
  director?: string;
  posterUrl: string;
  backdropUrl:string;
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
  title: string;
  year: number;
  genres: string[];
  rating: number;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  episodes?: Episode[];
  trailerUrl?: string;
  cast?: string[];
}
