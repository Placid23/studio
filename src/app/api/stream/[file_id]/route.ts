import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { file_id: string } }
) {
  const fileId = params.file_id;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return new NextResponse('Telegram Bot Token is not configured.', { status: 500 });
  }

  if (!fileId) {
    return new NextResponse('File ID is missing.', { status: 400 });
  }

  try {
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

    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    const videoResponse = await fetch(fileUrl);

    if (!videoResponse.ok || !videoResponse.body) {
        return new NextResponse('Could not fetch video file from Telegram.', { status: 500 });
    }

    const { body, headers } = videoResponse;
    
    // Create a new response with the video stream and appropriate headers
    return new Response(body, {
        status: 200,
        headers: {
            'Content-Type': headers.get('Content-Type') || 'video/mp4',
            'Content-Length': headers.get('Content-Length') || '',
            'Accept-Ranges': 'bytes',
            'Content-Disposition': `inline; filename="${fileId}.mp4"`
        },
    });

  } catch (error: any) {
    console.error('Error in streaming proxy:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
