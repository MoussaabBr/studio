
"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/auth/logout-button';
import LoadingPage from '@/components/loading-page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle2, Mail, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !user) {
    return <LoadingPage />;
  }

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };
  
  const registrationDate = user.createdAt?.seconds 
    ? format(new Date(user.createdAt.seconds * 1000), "MMMM d, yyyy")
    : "Not available";


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4 selection:bg-accent selection:text-accent-foreground">
      <Card className="w-full max-w-lg text-left shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/5 p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-accent">
              {/* Placeholder for user avatar image */}
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/128/128`} alt={user.username} data-ai-hint="profile avatar" />
              <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-bold text-primary">{user.username}</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Welcome to your dashboard!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <h3 className="text-xl font-semibold text-primary border-b pb-2 mb-4">Account Details</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserCircle2 className="h-6 w-6 text-accent" />
              <p className="text-md">
                <span className="font-medium text-foreground">Username:</span> {user.username}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-accent" />
              <p className="text-md">
                <span className="font-medium text-foreground">Email:</span> {user.email || 'Not provided'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-6 w-6 text-accent" />
              <p className="text-md">
                <span className="font-medium text-foreground">Member Since:</span> {registrationDate}
              </p>
            </div>
          </div>
           {/* Placeholder for future content */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Coming Soon</h4>
            <p className="text-sm text-muted-foreground">More exciting features will be available here shortly. Stay tuned!</p>
             <Image 
                src="https://picsum.photos/400/200" 
                alt="Feature placeholder" 
                width={400} 
                height={200} 
                className="rounded-md mt-3 w-full h-auto object-cover"
                data-ai-hint="abstract illustration"
              />
          </div>
        </CardContent>
        <CardFooter className="bg-primary/5 p-6 border-t border-border flex justify-end">
          <LogoutButton />
        </CardFooter>
      </Card>
    </div>
  );
}
