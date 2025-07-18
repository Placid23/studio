import { type NextRequest, NextResponse } from 'next/server';

// This route will now use the default Node.js runtime, which is more robust for streaming.

export async function GET(
  request: NextRequest,
  { params }: { params: { file_id: string } }
) {
  const fileId = params.file_id;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not configured.');
    return new NextResponse('Telegram Bot Token is not configured.', { status: 500 });
  }

  if (!fileId) {
    return new NextResponse('File ID is missing.', { status: 400 });
  }

  try {
    // Step 1: Get the file path from the Telegram Bot API
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileInfoResponse = await fetch(getFileUrl);

    if (!fileInfoResponse.ok) {
      const errorData = await fileInfoResponse.json();
      console.error('Telegram getFile API error:', errorData);
      return new NextResponse(`Error fetching file info from Telegram: ${errorData.description}`, { status: fileInfoResponse.status });
    }

    const fileInfo = await fileInfoResponse.json();
    if (!fileInfo.ok || !fileInfo.result.file_path) {
      return new NextResponse('Could not retrieve file path from Telegram.', { status: 500 });
    }
    const filePath = fileInfo.result.file_path;

    // Step 2: Construct the actual file URL and fetch the video stream
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const videoResponse = await fetch(fileUrl);

    if (!videoResponse.ok || !videoResponse.body) {
      return new NextResponse('Could not fetch video file from Telegram.', { status: videoResponse.status });
    }

    // Create a new response by streaming the video body
    // The ReadableStream from `fetch` is directly compatible with Next.js's Response object in the Node.js runtime.
    return new Response(videoResponse.body, {
      status: 200,
      headers: {
        'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': videoResponse.headers.get('Content-Length') || '',
        'Content-Disposition': `inline; filename="${fileId}.mp4"`,
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error: any) {
    console.error('Error in streaming proxy:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
