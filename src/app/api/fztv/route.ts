
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import axios from "axios";
import * as cheerio from "cheerio";

const MIRRORS = [
  "https://fztvseries.live",
  "https://fztvseries.mobi",
  "https://www.tvseries.in",
  "https://www.tvseries.video",
];
const SEARCH_PATHS = [
  (q: string) => `/search.php?search=${encodeURIComponent(q)}&beginsearch=Search&vsearch=&by=series`,
  (q: string) => `/search/?q=${encodeURIComponent(q)}`,
];

function absUrl(relative: string, base: string) {
  if (!relative) return "";
  if (relative.startsWith("http")) return relative;
  return `${base}${relative.startsWith("/") ? "" : "/"}${relative}`;
}

async function fetchHtml(url: string, base: string) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
      "Referer": base,
    },
    timeout: 15000,
  });
  return res.data;
}

async function searchSeries(query: string) {
  for (const base of MIRRORS) {
    for (const makePath of SEARCH_PATHS) {
      const url = `${base}${makePath(query)}`;
      try {
        const html = await fetchHtml(url, base);
        const $ = cheerio.load(html);
        const results = $("a")
          .map((_, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim();
            if (href && href.includes("/series/")) {
              return { title: text, url: absUrl(href, base) };
            }
            return null;
          })
          .get()
          .filter((r): r is { title: string; url: string; } => r !== null);
        if (results.length > 0) return results;
      } catch (err) {
        console.warn(`[searchSeries] Failed at ${url}:`, (err as Error).message);
      }
    }
  }
  throw new Error(`No series found for "${query}" on any mirror.`);
}

async function getSeasons(seriesUrl: string) {
  let lastError: Error | null = null;
  for (const base of MIRRORS) {
    try {
      const urlToFetch = seriesUrl.includes('://') ? seriesUrl : `${base}${seriesUrl.startsWith('/') ? '' : '/'}${seriesUrl}`;
      const html = await fetchHtml(urlToFetch, base);
      const $ = cheerio.load(html);
      const seasons = $("a")
        .map((_, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim();
          if (href && text.toLowerCase().includes("season")) {
            return { season: text, url: absUrl(href, base) };
          }
          return null;
        })
        .get()
        .filter((r): r is { season: string; url: string; } => r !== null);
      if (seasons.length > 0) return seasons;
    } catch (err) {
       lastError = err as Error;
       console.warn(`[getSeasons] Failed for url ${seriesUrl} on base ${base}:`, (err as Error).message);
    }
  }
  throw new Error(`No seasons found. Last error: ${lastError?.message}`);
}

async function getEpisodes(seasonUrl: string) {
  let lastError: Error | null = null;
  for (const base of MIRRORS) {
    try {
      const urlToFetch = seasonUrl.includes('://') ? seasonUrl : `${base}${seasonUrl.startsWith('/') ? '' : '/'}${seasonUrl}`;
      const html = await fetchHtml(urlToFetch, base);
      const $ = cheerio.load(html);
      const episodes = $("div.mainbox_L a")
        .map((_, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim();
          if (href && href.includes("/episode/")) {
            return { episode: text, url: absUrl(href, base) };
          }
          return null;
        })
        .get()
        .filter((r): r is { episode: string; url: string; } => r !== null);
      if (episodes.length > 0) return episodes;
    } catch (err) {
      lastError = err as Error;
      console.warn(`[getEpisodes] Failed for url ${seasonUrl} on base ${base}:`, (err as Error).message);
    }
  }
  throw new Error(`No episodes found. Last error: ${lastError?.message}`);
}

async function getDownloadLinks(episodeUrl: string) {
    let lastError: Error | null = null;
    for (const base of MIRRORS) {
      try {
        const urlToFetch = episodeUrl.includes('://') ? episodeUrl : `${base}${episodeUrl.startsWith('/') ? '' : '/'}${episodeUrl}`;
        const html = await fetchHtml(urlToFetch, base);
        const $ = cheerio.load(html);
        const links = $("div.mainbox_L a")
          .map((_, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim();
            if (href && href.includes("/download.php")) {
              return { quality: text, url: absUrl(href, base) };
            }
            return null;
          })
          .get()
          .filter((r): r is { quality: string; url: string; } => r !== null);
        if (links.length > 0) return links;
      } catch (err) {
         lastError = err as Error;
         console.warn(`[getDownloadLinks] Failed for url ${episodeUrl} on base ${base}:`, (err as Error).message);
      }
    }
    throw new Error(`No download links found. Last error: ${lastError?.message}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, url } = body;

    switch (action) {
      case 'search': {
        if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        const searchResults = await searchSeries(query);
        return NextResponse.json(searchResults);
      }

      case 'seasons': {
        if (!url) return NextResponse.json({ error: 'Missing series URL' }, { status: 400 });
        const seasons = await getSeasons(url);
        return NextResponse.json(seasons);
      }

      case 'episodes': {
        if (!url) return NextResponse.json({ error: 'Missing season URL' }, { status: 400 });
        const episodes = await getEpisodes(url);
        return NextResponse.json(episodes);
      }

      case 'download': {
        if (!url) return NextResponse.json({ error: 'Missing episode URL' }, { status: 400 });
        const downloadLinks = await getDownloadLinks(url);

        const proxied = downloadLinks.map((link: { quality: string; url: string }) => ({
          quality: link.quality,
          streamUrl: `/api/proxy-download?url=${encodeURIComponent(link.url)}`,
          downloadUrl: `/api/proxy-download?url=${encodeURIComponent(link.url)}&download=true`,
        }));

        return NextResponse.json(proxied);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err: any) {
    console.error(`[API /api/fztv] Error processing request:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
