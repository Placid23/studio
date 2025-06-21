import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0; // Do not cache this route

export async function GET(
  request: NextRequest,
  { params }: { params: { file_id: string } }
) {
  const fileId = params.file_id;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return new NextResponse('Telegram Bot Token not configured', { status: 500 });
  }

  if (!fileId) {
    return new NextResponse('File ID is missing', { status: 400 });
  }

  try {
    // Step 1: Get the file path from Telegram
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileInfoResponse = await fetch(getFileUrl);

    if (!fileInfoResponse.ok) {
        const error = await fileInfoResponse.json();
        console.error('Telegram getFile API error:', error);
        return new NextResponse(`Failed to get file info from Telegram: ${error.description || 'Unknown error'}`, { status: fileInfoResponse.status });
    }

    const fileInfo = await fileInfoResponse.json();
    if (!fileInfo.ok || !fileInfo.result.file_path) {
        console.error('Invalid response from Telegram getFile API:', fileInfo);
        return new NextResponse('Failed to get file path from Telegram', { status: 500 });
    }

    const filePath = fileInfo.result.file_path;

    // Step 2: Construct the actual file download URL
    const fileDownloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    // Step 3: Fetch the file and stream it back
    const videoResponse = await fetch(fileDownloadUrl);

    if (!videoResponse.ok || !videoResponse.body) {
        return new NextResponse('Failed to download file from Telegram', { status: 500 });
    }
    
    // Create a new stream from the video response body
    const stream = videoResponse.body;

    // Return the stream with appropriate headers
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': videoResponse.headers.get('Content-Length') || '',
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error) {
    console.error('Error streaming from Telegram:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
