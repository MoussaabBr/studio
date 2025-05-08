
import type { IronSessionOptions } from 'iron-session';
import type { User } from '@prisma/client'; // Using Prisma User type

export interface SessionData {
  user?: Omit<User, 'password'>; // Store user data without password
  isLoggedIn?: boolean;
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'myapp-session', // Choose a unique name
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
