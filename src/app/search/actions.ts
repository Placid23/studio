'use server';

import type { Movie, Show } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

function mapSupabaseItemToMedia(item: any): Movie | Show {
    const common = {
      id: String(item.id),
      supabaseId: item.id,
      title: item.title,
      year: item.year || 0,
      genres: item.genres || [],
      rating: item.rating || 0,
      synopsis: item.synopsis || 'No synopsis available.',
      posterUrl: item.poster_url || 'https://placehold.co/500x750.png',
      backdropUrl: item.backdrop_url || 'https://placehold.co/1920x1080.png',
    };
    if (item.type === 'movie') {
      return { ...common, type: 'movie' };
    } else {
      return { ...common, type: 'show' };
    }
}

export async function getAvailableGenres(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('movies').select('genres');

  if (error || !data) {
    return [];
  }

  const allGenres = data.flatMap(item => item.genres || []);
  return [...new Set(allGenres)].sort();
}

export async function searchMedia(
  searchTerm: string,
  filters: { genre: string; rating: string; year: string }
): Promise<(Movie | Show)[]> {
  const supabase = createClient();
  let query = supabase.from('movies').select('*, telegram_file_id');

  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }

  if (filters.genre && filters.genre !== 'all') {
    query = query.contains('genres', [filters.genre]);
  }

  if (filters.year && filters.year !== 'all') {
    query = query.eq('year', parseInt(filters.year, 10));
  }

  if (filters.rating && filters.rating !== 'all') {
    query = query.gte('rating', parseFloat(filters.rating));
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
  
  if (error) {
    console.error("Supabase search error:", error);
    return [];
  }

  return data.map(mapSupabaseItemToMedia);
}
