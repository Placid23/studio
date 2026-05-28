import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { MediaCard } from '@/components/media/MediaCard';
import type { Movie, Show } from '@/lib/types';
import { AlertTriangle, Clapperboard } from 'lucide-react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function LibraryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;

  if (!token) {
    return redirect('/login?message=You must be logged in to view your library.');
  }

  let enrichedLibrary: (Movie | Show)[] = [];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const snapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('watchlist')
      .orderBy('addedAt', 'desc')
      .get();

    enrichedLibrary = snapshot.docs.map(doc => {
      const item = doc.data();
      return {
        tmdbId: String(item.tmdb_id),
        supabaseId: doc.id, // Using doc ID as generic library ID
        title: item.title,
        type: item.type,
        year: item.year || 0,
        genres: item.genres || [],
        rating: item.rating || 0,
        synopsis: item.synopsis || 'No synopsis available.',
        posterUrl: item.poster_url || 'https://placehold.co/500x750.png',
        backdropUrl: item.backdrop_url || 'https://placehold.co/1920x1080.png',
        file_id: item.file_id
      } as (Movie | Show);
    });

  } catch (e: any) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
             <h1 className="text-2xl font-bold text-destructive">Error fetching library</h1>
             <p className="mt-2 text-destructive/80">{e.message}</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-primary uppercase tracking-wider mb-8">
        My Library
      </h1>
      {enrichedLibrary.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {enrichedLibrary.map((media) => (
            <MediaCard 
              key={media.supabaseId} 
              media={media}
              watchHref={`/watch/${media.tmdbId}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Clapperboard className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">Your Library is Empty</h2>
          <p className="mt-2 text-muted-foreground">Content you add to your library will appear here.</p>
        </div>
      )}
    </div>
  );
}
