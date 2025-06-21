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
    // Step 1: Get the file path from Telegram
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileInfoResponse = await fetch(getFileUrl);

    // Call .json() only ONCE to consume the response body
    const fileInfo = await fileInfoResponse.json();

    if (!fileInfoResponse.ok || !fileInfo.ok) {
        console.error(`Telegram getFile API error for fileId ${fileId}:`, fileInfo);
        return new NextResponse(`Failed to get file info from Telegram: ${fileInfo.description || 'Unknown error'}`, { status: fileInfoResponse.status });
    }

    if (!fileInfo.result.file_path) {
        console.error(`Invalid response from Telegram getFile API for fileId ${fileId}:`, fileInfo);
        return new NextResponse('Failed to get file path from Telegram', { status: 500 });
    }

    const filePath = fileInfo.result.file_path;

    // Step 2: Construct the actual file download URL
    const fileDownloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    // Step 3: Fetch the file and stream it back
    const videoResponse = await fetch(fileDownloadUrl);

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error(`Failed to download file from Telegram for fileId ${fileId}. Status: ${videoResponse.status}`, errorText);
      return new NextResponse('Failed to download file from Telegram', { status: videoResponse.status });
    }

    if (!videoResponse.body) {
      console.error(`Failed to download file from Telegram for fileId ${fileId}: Response body is null.`);
      return new NextResponse('Failed to download file from Telegram: Empty response', { status: 500 });
    }
    
    const stream = videoResponse.body;

    // Return the stream with appropriate headers
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': videoResponse.headers.get('Content-Length') || '',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, no-store',
      },
    });

  } catch (error) {
    console.error(`Error streaming from Telegram for fileId ${fileId}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
