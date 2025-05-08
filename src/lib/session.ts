
import type { IronSessionOptions } from 'iron-session';
import type { UserProfile } from '@/services/user-service'; // Using UserProfile from service

export interface SessionData {
  user?: UserProfile; // Store user data without password
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
