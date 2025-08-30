
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response("Missing url parameter", { status: 400 });
    }

    // Handle range headers for streaming
    const range = req.headers.get("range") || undefined;

    const upstream = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
        'Referer': new URL(url).origin,
        ...(range ? { Range: range } : {}),
      },
      // Disable caching for the proxy request
      cache: 'no-store'
    });

    if (!upstream.ok && upstream.status !== 206) { // 206 is Partial Content
      const errorText = await upstream.text();
      console.error("Upstream fetch failed:", { status: upstream.status, body: errorText });
      return new Response("Failed to fetch file from upstream source.", { status: 502 });
    }

    // Pass headers from upstream (important: content-type, content-length, accept-ranges etc.)
    const headers = new Headers(upstream.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.delete('content-security-policy');

    // If user is downloading (not streaming), force download with a filename
    if (req.nextUrl.searchParams.has('download')) {
      const fileName = new URL(url).pathname.split('/').pop() || 'download';
      headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });

  } catch (err: any) {
    console.error("Proxy error:", err);
    return new Response("Proxy error: " + err.message, { status: 500 });
  }
}
