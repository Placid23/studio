import { adminDb, adminAuth, adminStorage } from '@/lib/firebase/admin';
import { notFound, redirect } from 'next/navigation';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle } from 'lucide-react';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { cookies } from 'next/headers';
import type { Track } from '@/lib/types';

async function getMediaDetails(id: string, userId: string, searchParams: { [key: string]: string | string[] | undefined }) {
    const { season, episode, type } = searchParams;

    let fileId: string | null = null;
    let title: string = 'Content';
    let mediaType: 'video' | 'audio' = 'video';
    let audioTrack: Track | null = null;
    let bucket: 'videos' | 'songs' = 'videos';
    let error: string | null = null;

    try {
        if (type === 'music') {
            mediaType = 'audio';
            bucket = 'songs';
            const doc = await adminDb.collection('users').doc(userId).collection('liked_songs').doc(id).get();
            
            if (!doc.exists) {
                throw new Error('This song is not in your liked songs or could not be found.');
            }
            
            const likedSong = doc.data()!;
            fileId = likedSong.file_id;
            title = likedSong.title;
            audioTrack = {
                id: Number(id),
                title: likedSong.title,
                artist: { name: likedSong.artist_name },
                album: { id: likedSong.album_id || 0, title: likedSong.album_title || '', cover_xl: likedSong.album_cover_url || ''},
                duration: likedSong.duration,
                preview: '', 
                type: 'track'
            };

        } else {
             mediaType = 'video';
             bucket = 'videos';

             const doc = await adminDb.collection('users').doc(userId).collection('watchlist').doc(id).get();

            if (!doc.exists) {
                throw new Error("This title hasn't been added to your library yet.");
            }
            
            const movieData = doc.data()!;
            title = movieData.title;

            if (season && episode) {
                 const epSnapshot = await adminDb
                    .collection('users')
                    .doc(userId)
                    .collection('watchlist')
                    .doc(id)
                    .collection('episodes')
                    .where('season', '==', Number(season))
                    .where('episode', '==', Number(episode))
                    .limit(1)
                    .get();

                if (epSnapshot.empty || !epSnapshot.docs[0].data().file_id) {
                    throw new Error(`Episode S${season}E${episode} not found in your library.`);
                }
                const episodeData = epSnapshot.docs[0].data();
                fileId = episodeData.file_id;
                title = `${movieData.title} S${String(episodeData.season).padStart(2, '0')}E${String(episodeData.episode).padStart(2, '0')}`;
            } else {
                 if (!movieData.file_id) {
                    throw new Error("This movie is in your library, but a video file hasn't been linked to it yet.");
                }
                fileId = movieData.file_id;
            }
        }
    } catch (e: any) {
        error = e.message;
    }
    
    if (!fileId && !error) {
        error = 'This item does not have a playable file associated with it in your library.';
    }
    
    return { fileId, title, mediaType, audioTrack, bucket, error };
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;
  if (!token) redirect('/login?message=You must be logged in to watch content.');

  let userId;
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (e) {
    redirect('/login?message=Session expired. Please login again.');
  }

  const { fileId, title, mediaType, audioTrack, bucket, error } = await getMediaDetails(id, userId, resolvedSearchParams);

  if (!fileId || error) {
    return (
        <div className="bg-background text-foreground min-h-screen h-screen flex flex-col relative">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-border bg-background/20 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm" />
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Media Not Playable</h1>
                <p className="text-muted-foreground max-w-md">{error || 'This item could not be found in your library.'}</p>
                </div>
            </main>
        </div>
    );
  }

  // Get signed URL from Firebase Storage
  let signedUrl;
  try {
    const file = adminStorage.bucket().file(fileId);
    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    signedUrl = url;
  } catch (e: any) {
    return (
        <div className="bg-background text-foreground min-h-screen h-screen flex flex-col relative">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-border bg-background/20 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm" />
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Streaming Error</h1>
                <p className="text-muted-foreground max-w-md">Could not generate a secure link to play the content. {e.message}</p>
                </div>
            </main>
        </div>
    );
  }

  if (mediaType === 'audio' && audioTrack) {
    const fullTrack = { ...audioTrack, preview: signedUrl };
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="text-4xl font-black text-primary uppercase tracking-wider my-8">
                Now Playing
            </h1>
            <div className="max-w-2xl mx-auto">
                <AudioPlayer tracks={[fullTrack]} autoPlay />
            </div>
        </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
      <VideoPlayer src={signedUrl} title={title} />
    </div>
  );
}