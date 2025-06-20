export interface Movie {
  id: string;
  title: string;
  year: number;
  duration: number; // in minutes
  genres: string[];
  rating: number;
  synopsis: string;
  cast: string[];
  director: string;
  posterUrl: string;
  backdropUrl:string;
}
