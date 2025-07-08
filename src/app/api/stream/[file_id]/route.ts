import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('This streaming method is no longer supported.', { status: 404 });
}
