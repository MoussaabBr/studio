
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter for a clean, modern look
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Using CSS variable for font
});

export const metadata: Metadata = {
  title: 'Auth Starter Pro', // Updated title
  description: 'A professionally styled authentication application by Firebase Studio', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
