'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useState, useTransition } from 'react';

export default function Signup() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setError(null);

    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        
        // Store token in cookie for server-side auth
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
        
        setSuccess(true);
        setTimeout(() => {
            router.push('/');
            router.refresh();
        }, 1500);
      } catch (err: any) {
        let errorMsg = "Could not create account. Please try again.";
        if (err.code === 'auth/email-already-in-use') {
            errorMsg = "This email is already in use.";
        } else if (err.code === 'auth/invalid-email') {
            errorMsg = "Please enter a valid email address.";
        }
        setError(errorMsg);
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="border-primary/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Sign Up</CardTitle>
            <CardDescription>Create your NovaStream account to start building your library</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={isPending || success} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required disabled={isPending || success} />
                <p className="text-[10px] text-muted-foreground">Must be at least 6 characters.</p>
              </div>
              
              {error && (
                <Alert variant="destructive" className="animate-in fade-in zoom-in duration-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/50 bg-green-500/10 text-green-500 animate-in fade-in zoom-in duration-200">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>Account created! Taking you home...</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full font-bold" disabled={isPending || success}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary hover:text-primary/80 transition-colors">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
