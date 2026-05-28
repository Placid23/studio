import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  // Redirect to home as Supabase auth is deprecated
  return NextResponse.redirect(`${origin}/`);
}
