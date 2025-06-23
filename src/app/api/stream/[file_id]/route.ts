import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Do not cache this route

export async function GET(
  request: NextRequest,
  { params }: { params: { file_id: string } }
) {
  const fileId = params.file_id;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not configured.');
    return new NextResponse('Telegram Bot Token not configured', { status: 500 });
  }

  if (!fileId) {
    return new NextResponse('File ID is missing', { status: 400 });
  }

  try {
    // 1. Get file path and size from Telegram
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileInfoResponse = await fetch(getFileUrl);
    const fileInfo = await fileInfoResponse.json();

    if (!fileInfoResponse.ok || !fileInfo.ok) {
      console.error(`Telegram getFile API error for fileId ${fileId}:`, fileInfo);
      return new NextResponse(`Failed to get file info from Telegram: ${fileInfo.description || 'Unknown error'}`, { status: fileInfo.error_code || 500 });
    }

    if (!fileInfo.result.file_path) {
      console.error(`Invalid response from Telegram getFile API for fileId ${fileId}:`, fileInfo);
      return new NextResponse('Failed to get file path from Telegram', { status: 500 });
    }

    const filePath = fileInfo.result.file_path;
    const fileDownloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    // 2. Proxy Range requests for video seeking
    const range = request.headers.get('range');
    const headers = new Headers();
    if (range) {
      headers.set('range', range);
    }

    // 3. Fetch the video file (or a chunk of it) from Telegram
    const videoResponse = await fetch(fileDownloadUrl, { headers });

    if (!videoResponse.ok || !videoResponse.body) {
      const errorText = await videoResponse.text();
      console.error(`Failed to download file from Telegram for fileId ${fileId}. Status: ${videoResponse.status}`, errorText);
      return new NextResponse(errorText || 'Failed to download file from Telegram', { status: videoResponse.status });
    }

    // 4. Proxy the stream and headers from Telegram back to the client
    const responseHeaders = new Headers(videoResponse.headers);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    const { readable, writable } = new TransformStream();
    videoResponse.body.pipeTo(writable);
    
    return new NextResponse(readable, {
      status: videoResponse.status,
      statusText: videoResponse.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error(`Error streaming from Telegram for fileId ${fileId}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
