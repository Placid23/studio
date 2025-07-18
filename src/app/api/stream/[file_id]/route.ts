import { type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { file_id: string } }
) {
  const file_id = params.file_id;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN || !file_id) {
    return new Response('Missing TELEGRAM_BOT_TOKEN or file_id', { status: 400 });
  }

  try {
    // Step 1: Get file path from Telegram
    const fileRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`
    );

    const fileData = await fileRes.json();

    if (!fileData.ok) {
      console.error("Telegram getFile API error:", fileData);
      return new Response(JSON.stringify(fileData), { status: 400 });
    }

    const filePath = fileData.result.file_path;

    // Step 2: Stream video file
    const videoRes = await fetch(
      `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
    );
      
    if (!videoRes.ok || !videoRes.body) {
        return new Response('Could not fetch video file from Telegram.', { status: videoRes.status });
    }

    const headers = new Headers(videoRes.headers);
    headers.set('Content-Disposition', 'inline');
    headers.set('Content-Type', 'video/mp4');

    return new Response(videoRes.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Streaming error:', err);
    return new Response('Error streaming file', { status: 500 });
  }
}
