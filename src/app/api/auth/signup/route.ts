
import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/services/user-service';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
    }

    const { email, username, password } = validation.data;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // In a real app, consider username uniqueness check as well
    // const existingUsername = await prisma.user.findUnique({ where: { username }});
    // if (existingUsername) {
    //   return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    // }

    const user = await createUser({ email, username, password_DO_NOT_LOG: password });

    // For simplicity, not logging in user automatically after signup.
    // Could extend this to create a session immediately.
    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
