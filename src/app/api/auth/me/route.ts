
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Get current user error:', error);
    // It's important not to return 500 for session checks if session is just invalid/expired
    // but if iron-session itself throws an unrecoverable error, then 500 is appropriate.
    // For now, assume if session is not there, it's equivalent to no user.
    return NextResponse.json({ user: null, error: 'Session error' }, { status: 200 });
  }
}
