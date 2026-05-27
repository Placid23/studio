'use server';

import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import type { LikedSong, Track } from '@/lib/types';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;
  if (!token) return null;
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

export async function getLikedSongsAction(): Promise<LikedSong[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const snapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('liked_songs')
    .orderBy('likedAt', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: Number(doc.id),
      title: data.title,
      duration: data.duration,
      preview: data.preview_url || '',
      artist: { name: data.artist_name },
      album: {
        id: data.album_id,
        title: data.album_title,
        cover_xl: data.album_cover_url || ''
      },
      type: 'track',
      likedAt: data.likedAt
    } as LikedSong;
  });
}

export async function toggleLikeAction(track: Track): Promise<{ success: boolean; isLiked: boolean; message: string }> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, isLiked: false, message: 'You must be logged in to like songs.' };
  }

  const songRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('liked_songs')
    .doc(String(track.id));

  const doc = await songRef.get();

  if (doc.exists) {
    await songRef.delete();
    revalidatePath('/music');
    return { success: true, isLiked: false, message: `Removed "${track.title}" from your liked songs.` };
  } else {
    await songRef.set({
      title: track.title,
      duration: track.duration,
      preview_url: track.preview,
      artist_name: track.artist.name,
      album_id: track.album.id,
      album_title: track.album.title,
      album_cover_url: track.album.cover_xl,
      likedAt: Date.now(),
      file_id: null,
    });
    revalidatePath('/music');
    return { success: true, isLiked: true, message: `Added "${track.title}" to your liked songs.` };
  }
}

export async function searchYoutubeVideo(query: string): Promise<string | null> {
    const searchUrl = new URL('https://www.youtube.com/results');
    searchUrl.searchParams.set('search_query', query);
    try {
        const response = await fetch(searchUrl.toString());
        if (!response.ok) return null;
        const html = await response.text();
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return null;
    }
}