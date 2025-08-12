
'use server';

import { createClient } from '@/lib/supabase/server';
import type { MusicTrack } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function getMusicTracks(): Promise<MusicTrack[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('music_tracks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching music tracks:', error);
    return [];
  }

  return data as MusicTrack[];
}

export async function getSignedUrl(fileId: string): Promise<{ signedUrl: string; error: string | null }> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login?message=You must be logged in to download music.');
    }

    const { data, error } = await supabase.storage
        .from('music') // Assumes your bucket is named 'music'
        .createSignedUrl(fileId, 60 * 60); // URL valid for 1 hour

    if (error) {
        console.error('Error creating signed URL:', error);
        return { signedUrl: '', error: error.message };
    }

    return { signedUrl: data.signedUrl, error: null };
}
