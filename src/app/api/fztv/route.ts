
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { searchSeries, getSeasons, getEpisodes, getDownloadLinks } from '@/lib/fztv';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, url } = body;

    switch (action) {
      case 'search':
        if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        const searchResults = await searchSeries(query);
        return NextResponse.json(searchResults);

      case 'seasons':
        if (!url) return NextResponse.json({ error: 'Missing series URL' }, { status: 400 });
        const seasons = await getSeasons(url);
        return NextResponse.json(seasons);

      case 'episodes':
        if (!url) return NextResponse.json({ error: 'Missing season URL' }, { status: 400 });
        const episodes = await getEpisodes(url);
        return NextResponse.json(episodes);

      case 'download':
        if (!url) return NextResponse.json({ error: 'Missing episode URL' }, { status: 400 });
        const downloadLinks = await getDownloadLinks(url);
        return NextResponse.json(downloadLinks);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error(`[API /api/fztv] Error processing request:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
