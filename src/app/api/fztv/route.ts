'use server';

import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const MIRRORS = [
  "https://fztvseries.live",
  "https://fztvseries.mobi",
];

function absUrl(href: string, base: string) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  return `${base}/${href.replace(/^\//, '')}`;
}

async function fetchWithFallback(path: string): Promise<{ data: string; base: string }> {
  let lastError: any = null;
  for (const base of MIRRORS) {
    try {
      const url = path.startsWith("http") ? path : `${base}/${path.replace(/^\//, '')}`;
      const res = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
        },
      });
      if (res.status === 200) return { data: res.data, base };
    } catch (err) {
      lastError = err;
      console.warn(`[Mirror failed] ${base}:`, err);
    }
  }
  throw new Error("All mirrors failed: " + (lastError?.message || "Unknown error"));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, url } = body;

    switch (action) {
      case "search": {
        if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

        const { data, base } = await fetchWithFallback(
          `search.php?search=${encodeURIComponent(query)}&beginsearch=Search&vsearch=&by=series`
        );
        const $ = cheerio.load(data);

        const results: { title: string; url: string }[] = [];
        const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);

        $("a").each((_, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim();

          if (href && (href.includes("/series/") || href.includes("subfolder-"))) {
             if (!/home|contact|latest|popular|privacy/i.test(text)) {
                results.push({ title: text, url: absUrl(href, base) });
             }
          }
        });

        if (results.length === 0) throw new Error(`No series found for "${query}".`);

        // Sort results by relevance
        results.sort((a, b) => {
          const aScore = queryWords.filter(w => a.title.toLowerCase().includes(w)).length;
          const bScore = queryWords.filter(w => b.title.toLowerCase().includes(w)).length;
          return bScore - aScore;
        });

        return NextResponse.json(results);
      }

      case "seasons": {
        if (!url) return NextResponse.json({ error: "Missing series URL" }, { status: 400 });

        const { data, base } = await fetchWithFallback(url);
        const $ = cheerio.load(data);

        const seasons: { season: string; url: string }[] = [];

        $("a").each((_, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim();
          if (href && text.toLowerCase().includes("season")) {
            seasons.push({ season: text, url: absUrl(href, base) });
          }
        });

        if (seasons.length === 0) {
          const episodeLinks = $("div.mainbox_L a[href*='/episode/']");
          if (episodeLinks.length > 0) {
            seasons.push({
              season: "Season 1",
              url,
            });
          }
        }

        if (seasons.length === 0) throw new Error("No seasons found.");
        return NextResponse.json(seasons);
      }

      case "episodes": {
        if (!url) return NextResponse.json({ error: "Missing season URL" }, { status: 400 });

        const { data, base } = await fetchWithFallback(url);
        const $ = cheerio.load(data);

        const episodes: { episode: string; url: string }[] = [];
        $("div.mainbox_L a").each((_, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim();
          if (href && href.includes("/episode/")) {
            episodes.push({ episode: text, url: absUrl(href, base) });
          }
        });

        if (episodes.length === 0) throw new Error("No episodes found.");
        return NextResponse.json(episodes);
      }

      case "download": {
        if (!url) return NextResponse.json({ error: "Missing episode URL" }, { status: 400 });

        const { data, base } = await fetchWithFallback(url);
        const $ = cheerio.load(data);

        const downloadLinks: { quality: string; url: string }[] = [];
        $("div.mainbox_L a").each((_, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim();
          if (href && href.includes("download.php")) {
            downloadLinks.push({ quality: text, url: absUrl(href, base) });
          }
        });
        
        if (downloadLinks.length === 0) throw new Error("No download links found.");

        const proxied = downloadLinks.map((link: { quality: string; url: string }) => ({
          quality: link.quality,
          streamUrl: `/api/proxy-download?url=${encodeURIComponent(link.url)}`,
          downloadUrl: `/api/proxy-download?url=${encodeURIComponent(link.url)}&download=true`,
        }));


        return NextResponse.json(proxied);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error(`[API /api/fztv] Error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
