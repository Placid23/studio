// This streaming implementation has been removed.
// A new implementation will be added later.
import {NextResponse} from 'next/server';

export async function GET() {
  return new NextResponse('Not Found', {status: 404});
}
