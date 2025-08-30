
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { searchSeries, getSeasons, getEpisodes, getDownloadLinks } from '@/lib/fztv';

async function handleAction(action?: string, query?: string, url?: string) {
  switch (action) {
    case 'search':
      if (!query) throw new Error('Missing query');
      return await searchSeries(query);

    case 'seasons':
      if (!url) throw new Error('Missing series URL');
      return await getSeasons(url);

    case 'episodes':
      if (!url) throw new Error('Missing season URL');
      return await getEpisodes(url);

    case 'download':
      if (!url) throw new Error('Missing episode URL');
      return await getDownloadLinks(url);

    default:
      throw new Error('Invalid action');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, url } = body;
    const result = await handleAction(action, query, url);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API /api/fztv POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || '';
    const query = searchParams.get('query') || undefined;
    const url = searchParams.get('url') || undefined;

    const result = await handleAction(action, query, url);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API /api/fztv GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
