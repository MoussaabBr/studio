
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/auth/logout-button';
import LoadingPage from '@/components/loading-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <LoadingPage />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            You are successfully logged in!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl">
            Welcome, <span className="font-semibold text-accent">{user?.username}</span>!
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
