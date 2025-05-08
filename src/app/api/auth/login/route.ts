
import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/services/user-service';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // Basic validation, server will check length if needed
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
    }
    
    const { email, password } = validation.data;

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.user = userWithoutPassword;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
