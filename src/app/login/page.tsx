'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useState, useTransition } from 'react';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setError(null);

    startTransition(async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        
        // Store token in cookie for server-side auth
        // Use a secure, Lax cookie for Next.js 15 compatibility
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
        
        router.push('/');
        router.refresh();
      } catch (err: any) {
        let errorMsg = "Failed to login. Please check your credentials.";
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            errorMsg = "Invalid email or password.";
        } else if (err.code === 'auth/too-many-requests') {
            errorMsg = "Too many failed attempts. Please try again later.";
        }
        setError(errorMsg);
      }
    });
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-sm"
      >
        <Card className="border-primary/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Login</CardTitle>
            <CardDescription>Enter your email below to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={isPending} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required disabled={isPending} />
              </div>
              
              {(message || error) && (
                <Alert variant="destructive" className="animate-in fade-in zoom-in duration-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Notice</AlertTitle>
                    <AlertDescription>{message || error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full font-bold" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Authenticating...' : 'Login'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
