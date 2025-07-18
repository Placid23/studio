import { NextResponse, type NextRequest } from 'next/server';
import { Readable } from 'stream';

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
    // Step 1: Get the file_path from Telegram's getFile method
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileInfoResponse = await fetch(getFileUrl);

    if (!fileInfoResponse.ok) {
      const errorData = await fileInfoResponse.json();
      console.error('Telegram getFile API error:', errorData);
      return new NextResponse(`Error fetching file info from Telegram: ${errorData.description}`, { status: fileInfoResponse.status });
    }

    const fileInfo = await fileInfoResponse.json();
    const filePath = fileInfo.result.file_path;

    if (!filePath) {
        return new NextResponse('Could not retrieve file path from Telegram.', { status: 500 });
    }

    // Step 2: Construct the final file URL and stream it
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    
    const videoResponse = await fetch(fileUrl);

    if (!videoResponse.ok || !videoResponse.body) {
        return new NextResponse('Could not fetch video file from Telegram.', { status: 500 });
    }

    // Create a new ReadableStream from the response body
    const readableStream = new ReadableStream({
        async start(controller) {
            if (!videoResponse.body) {
                controller.close();
                return;
            }
            const reader = videoResponse.body.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    controller.enqueue(value);
                }
            } catch (error) {
                controller.error(error);
            } finally {
                controller.close();
            }
        }
    });
    
    // Get necessary headers from the original response
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');
    
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) {
        headers.set('Content-Length', contentLength);
    }
    headers.set('Accept-Ranges', 'bytes'); // Important for seeking

    return new NextResponse(readableStream, {
        status: 200,
        headers,
    });

  } catch (error: any) {
    console.error('Error in streaming proxy:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}