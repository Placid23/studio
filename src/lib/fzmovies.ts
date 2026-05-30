'use server';

import fetchOrig from "node-fetch";
import { load } from "cheerio";
import tough from "tough-cookie";
import fetchCookie from "fetch-cookie";

const siteUrl = process.env.FZMOVIES_URL || "https://fzmovies.live";
const TIMEOUT = 200 * 1000; // ms

const defaultHeaders = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": siteUrl,
};

function createFetchWithJar() {
  const jar = new tough.CookieJar();
  // @ts-ignore
  const fetch = fetchCookie(fetchOrig, jar);
  return { fetch, jar };
}

function normalizeUrl(u: string) {
  if (!u) return u;
  return u.replace(/\\/g, "/");
}

function resolveUrl(href: string, base = siteUrl) {
  if (!href) return null;
  href = normalizeUrl(href).trim();
  try {
    return new URL(href, base).href;
  } catch (e) {
    return null;
  }
}

async function fetchWithTimeout(fetch: any, url: string, opts = {}, timeout = TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // @ts-ignore
    const response = await fetch(url, { ...opts, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function autoRun({ query, quality = "720p" }: { query: string; quality?: '720p' | '1080p' }) {
  if (!query || typeof query !== "string") {
    throw new Error("Query (string) is required");
  }

  const { fetch } = createFetchWithJar();
  const steps: any[] = [];

  const homeResp = await fetchWithTimeout(fetch, siteUrl, {
    method: "GET",
    headers: defaultHeaders,
  });
  if (!homeResp || homeResp.status >= 400) {
    throw new Error(`Failed to load homepage: ${homeResp?.status || "no response"}`);
  }
  await homeResp.text();
  steps.push({ step: "home", url: siteUrl });

  const searchEndpoint = resolveUrl("/csearch.php", siteUrl);
  const form = new URLSearchParams();
  form.append("searchname", query);
  form.append("Search", "Search");
  form.append("searchby", "Name");
  form.append("category", "All");
  form.append("vsearch", "");

  const searchResp = await fetchWithTimeout(fetch, searchEndpoint, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: siteUrl,
    },
    body: form.toString(),
  });
  if (!searchResp || searchResp.status >= 400) {
    throw new Error(`Search failed: ${searchResp?.status || "no response"}`);
  }
  const searchHtml = await searchResp.text();
  steps.push({ step: "search", url: searchEndpoint });

  const $s = load(searchHtml);
  let results: { title: string, href: string | null }[] = [];
  $s("a").each((_, el) => {
    const href = $s(el).attr("href") || "";
    const text = ($s(el).text() || "").trim();
    if (/\.htm($|\?)/i.test(href) && 
        text.length > 2 && 
        !/home|contact|latest|popular|privacy|terms|about|disclaimer/i.test(text)) {
      results.push({ title: text, href: resolveUrl(href, siteUrl) });
    }
  });

  if (results.length === 0) {
    const match = searchHtml.match(/href=["']([^"']+\.htm[^"']*)["']/i);
    if (match) results.push({ title: query, href: resolveUrl(match[1], siteUrl) });
  }

  if (results.length === 0) throw new Error("No movie results found from search");

  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
  let candidateMovie = results.reduce((best, current) => {
    const currentScore = queryWords.filter(word => current.title.toLowerCase().includes(word)).length;
    const bestScore = queryWords.filter(word => best.title.toLowerCase().includes(word)).length;
    return currentScore > bestScore ? current : best;
  }, results[0]);

  steps.push({ step: "pick_movie", movie: candidateMovie });

  const moviePageResp = await fetchWithTimeout(fetch, candidateMovie.href!, {
    method: "GET",
    headers: defaultHeaders,
  });
  if (!moviePageResp || moviePageResp.status >= 400) {
    throw new Error(`Failed to fetch movie page: ${moviePageResp?.status || "no response"}`);
  }
  const movieHtml = await moviePageResp.text();
  steps.push({ step: "movie_page", url: candidateMovie.href });

  const $m = load(movieHtml);
  let movieFileUrl = null;
  $m("a").each((_, el) => {
    const href = $m(el).attr("href") || "";
    if (href.includes("download1.php?downloadoptionskey")) {
      movieFileUrl = resolveUrl(href, candidateMovie!.href!);
      return false;
    }
  });
  if (!movieFileUrl) {
    const match = movieHtml.match(/href=["']([^"']*download1\.php\?downloadoptionskey=[^"']*)["']/i);
    if (match) movieFileUrl = resolveUrl(match[1], candidateMovie.href);
  }
  if (!movieFileUrl) throw new Error("Could not find movie file (download1) link on movie page");
  steps.push({ step: "movie_file_link", url: movieFileUrl });

  const download1Resp = await fetchWithTimeout(fetch, movieFileUrl, {
    method: "GET",
    headers: defaultHeaders,
  });
  if (!download1Resp || download1Resp.status >= 400) {
    throw new Error(`Failed to fetch download1 page: ${download1Resp?.status || "no response"}`);
  }
  const download1Html = await download1Resp.text();
  steps.push({ step: "download1_page", url: movieFileUrl });

  const $d1 = load(download1Html);
  let downloadLinks: { href: string | null; text: string }[] = [];
  $d1("a").each((_, el) => {
    const href = $d1(el).attr("href") || "";
    const text = ($d1(el).text() || "").trim();
    if (href.includes("download.php?downloadkey")) {
      downloadLinks.push({ href: resolveUrl(href, movieFileUrl!), text });
    }
  });
  if (!downloadLinks.length) {
    const allMatches = [...download1Html.matchAll(/href=["']([^"']*download\.php\?downloadkey=[^"']*)["']/ig)];
    allMatches.forEach(m => downloadLinks.push({ href: resolveUrl(m[1], movieFileUrl!), text: m[1] }));
  }
  if (!downloadLinks.length) throw new Error("No download.php links found on download1 page");

  const desired = (quality || "720p").toLowerCase();
  downloadLinks.sort((a,b) => {
    const aMatch = (a.text || a.href!).toLowerCase().includes(desired) ? 1 : 0;
    const bMatch = (b.text || b.href!).toLowerCase().includes(desired) ? 1 : 0;
    return bMatch - aMatch;
  });
  const chosenDownloadPage = downloadLinks[0].href;
  if (!chosenDownloadPage) throw new Error('Could not choose a download page link');
  steps.push({ step: "choose_download_page", candidates: downloadLinks, chosen: chosenDownloadPage });

  const downloadPageResp = await fetchWithTimeout(fetch, chosenDownloadPage, {
    method: "GET",
    headers: defaultHeaders,
  });
  if (!downloadPageResp || downloadPageResp.status >= 400) {
    throw new Error(`Failed to fetch download links page: ${downloadPageResp?.status || "no response"}`);
  }
  const downloadPageHtml = await downloadPageResp.text();
  steps.push({ step: "download_page", url: chosenDownloadPage });

  const $dl = load(downloadPageHtml);
  let dlinkCandidates: { href: string | null, text: string }[] = [];
  $dl("a").each((_, el) => {
    const href = $dl(el).attr("href") || "";
    const text = ($dl(el).text() || "").trim();
    if (href.includes("dlink.php?id=")) {
      dlinkCandidates.push({ href: resolveUrl(href, chosenDownloadPage), text });
    }
  });
  if (!dlinkCandidates.length) {
    const all = [...downloadPageHtml.matchAll(/href=["']([^"']*dlink\.php\?id=[^"']*)["']/ig)];
    all.forEach(m => dlinkCandidates.push({ href: resolveUrl(m[1], chosenDownloadPage), text: m[1] }));
  }
  if (!dlinkCandidates.length) throw new Error("No dlink.php links found on download page");
  const chosenDlink = dlinkCandidates[0].href;
  if (!chosenDlink) throw new Error('Could not choose a dlink page');
  steps.push({ step: "choose_dlink", candidates: dlinkCandidates, chosen: chosenDlink });

  const finalResp = await fetchWithTimeout(fetch, chosenDlink, {
    method: "GET",
    headers: defaultHeaders,
  });
  if (!finalResp || finalResp.status >= 400) {
    throw new Error(`Failed to fetch final dlink page: ${finalResp?.status || "no response"}`);
  }
  const finalHtml = await finalResp.text();
  steps.push({ step: "final_page", url: chosenDlink });

  const $f = load(finalHtml);
  let finalUrl = null;

  $f("a").each((_, el) => {
    const href = $f(el).attr("href") || "";
    if (/^https?:\/\//i.test(href) && !href.includes('fzmovies.live') && !href.includes('google.com')) {
      finalUrl = href;
      return false;
    }
  });

  if (!finalUrl) {
    const meta = $f("meta[http-equiv='refresh']").attr("content") || "";
    const m = meta.match(/url=(.*)$/i);
    if (m && m[1]) finalUrl = resolveUrl(m[1].trim(), chosenDlink);
  }

  if (!finalUrl) {
    const m2 = finalHtml.match(/https?:\/\/[^\s'"]{10,}\.mp4[^\s'"]*/i);
    if (m2) finalUrl = m2[0];
  }

  if (!finalUrl) throw new Error("Could not resolve final download URL");

  steps.push({ step: "resolved_final_url", finalUrl });

  return { title: candidateMovie.title || query, finalUrl, steps };
}
