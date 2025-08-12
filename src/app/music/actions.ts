
'use server';

import { createClient } from '@/lib/supabase/server';
import type { LikedSong, Track } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getLikedSongsAction(): Promise<LikedSong[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('liked_songs')
    .select('*')
    .eq('user_id', user.id)
    .order('liked_at', { ascending: false });

  if (error) {
    console.error('Error fetching liked songs:', error);
    return [];
  }
  
  // Map Supabase data to LikedSong type
  return data.map(item => ({
      id: item.id,
      title: item.title,
      duration: item.duration,
      preview: item.preview_url || '',
      artist: { name: item.artist_name },
      album: {
        id: 0, // Not stored in this table, can be omitted or set to default
        title: item.album_title,
        cover_xl: item.album_cover_url || ''
      },
      type: 'track',
      likedAt: new Date(item.liked_at).getTime()
  }));
}

export async function toggleLikeAction(track: Track): Promise<{ success: boolean; isLiked: boolean; message: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, isLiked: false, message: 'You must be logged in to like songs.' };
  }

  // Check if the song is already liked
  const { data: existingLike, error: selectError } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', user.id)
    .eq('id', track.id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // Ignore "row not found" error
    console.error('Error checking for existing like:', selectError);
    return { success: false, isLiked: false, message: 'Could not update your liked songs.' };
  }

  if (existingLike) {
    // Song is already liked, so unlike it
    const { error: deleteError } = await supabase
      .from('liked_songs')
      .delete()
      .eq('user_id', user.id)
      .eq('id', track.id);
    
    if (deleteError) {
      console.error('Error unliking song:', deleteError);
      return { success: false, isLiked: true, message: `Could not remove "${track.title}"` };
    }
    
    revalidatePath('/music');
    return { success: true, isLiked: false, message: `Removed "${track.title}" from your liked songs.` };

  } else {
    // Song is not liked, so like it
    const { error: insertError } = await supabase.from('liked_songs').insert({
      id: track.id,
      user_id: user.id,
      title: track.title,
      duration: track.duration,
      preview_url: track.preview,
      artist_name: track.artist.name,
      album_title: track.album.title,
      album_cover_url: track.album.cover_xl,
    });

    if (insertError) {
        console.error('Error liking song:', insertError);
        return { success: false, isLiked: false, message: `Could not add "${track.title}"` };
    }

    revalidatePath('/music');
    return { success: true, isLiked: true, message: `Added "${track.title}" to your liked songs.` };
  }
}
