
import { autoRun } from "@/lib/fzmovies";
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q");
        const quality = searchParams.get("quality") as '720p' | '1080p' | undefined;

        if (!q) {
            return new Response(JSON.stringify({ error: "Missing q parameter" }), { status: 400 });
        }

        const result = await autoRun({ query: q, quality: quality || "720p" });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
