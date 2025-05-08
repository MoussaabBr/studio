
import LoginForm from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Auth Starter',
  description: 'Login to access your account.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-6 sm:p-8 md:p-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
