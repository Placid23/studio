
'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

const MIRRORS = [
  "https://fztvseries.mobi",
  "https://www.tvseries.in",
  "https://www.tvseries.video",
];

const cache: Record<string, { data: any; expiry: number }> = {};
const TTL = 10 * 60 * 1000; // 10 minutes

function getCache(key: string) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any) {
  cache[key] = { data, expiry: Date.now() + TTL };
}

async function fetchWithFallback(path: string): Promise<{ data: string; base: string }> {
  let lastError: any = null;
  for (const base of MIRRORS) {
    try {
      const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
      const res = await axios.get(url, { timeout: 15000 });
      if (res.status === 200) {
        return { data: res.data, base };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Mirror failed] ${base}:`, err);
    }
  }
  throw new Error('All mirrors failed: ' + (lastError?.message || 'Unknown error'));
}

function absUrl(relative: string, base: string) {
  if (!relative) return '';
  if (relative.startsWith('http')) return relative;
  return `${base}${relative.startsWith('/') ? '' : '/'}${relative}`;
}

export async function searchSeries(query: string) {
  const cacheKey = `fztv:search:${query}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { data, base } = await fetchWithFallback(`search.php?search=${encodeURIComponent(query)}`);
  const $ = cheerio.load(data);

  const results: { title: string; url: string }[] = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && href.includes('/series/')) {
      results.push({ title: text, url: absUrl(href, base) });
    }
  });

  if (results.length === 0) {
    throw new Error(`No series found for "${query}".`);
  }

  setCache(cacheKey, results);
  return results;
}

export async function getSeasons(seriesUrl: string) {
  const cacheKey = `fztv:seasons:${seriesUrl}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  
  const { data, base } = await fetchWithFallback(seriesUrl);
  const $ = cheerio.load(data);

  const seasons: { season: string; url: string }[] = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && text.toLowerCase().includes('season')) {
      seasons.push({
        season: text,
        url: absUrl(href, base),
      });
    }
  });

  if (seasons.length === 0) throw new Error("No seasons found.");
  
  setCache(cacheKey, seasons);
  return seasons;
}

export async function getEpisodes(seasonUrl: string) {
    const cacheKey = `fztv:episodes:${seasonUrl}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const { data, base } = await fetchWithFallback(seasonUrl);
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

    setCache(cacheKey, episodes);
    return episodes;
}

export async function getDownloadLinks(episodeUrl: string) {
    const cacheKey = `fztv:download:${episodeUrl}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const { data, base } = await fetchWithFallback(episodeUrl);
    const $ = cheerio.load(data);
    
    const downloadLinks: { quality: string; url: string }[] = [];
    $("div.mainbox_L a").each((_, el) => {
        const href = $(el).attr("href");
        const text = $(el).text().trim();
        if (href && href.includes("/download.php")) {
            downloadLinks.push({ quality: text, url: absUrl(href, base) });
        }
    });

    if (downloadLinks.length === 0) throw new Error("No download links found.");

    setCache(cacheKey, downloadLinks);
    return downloadLinks;
}
