'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useState, useTransition } from 'react';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setError(null);
    setResetSent(false);

    startTransition(async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
        router.push('/');
        router.refresh();
      } catch (err: any) {
        let errorMsg = "Failed to login. Please check your credentials.";
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            errorMsg = "Invalid email or password.";
        } else if (err.code === 'auth/too-many-requests') {
            errorMsg = "Too many failed attempts. Please try again later.";
        }
        setError(errorMsg);
      }
    });
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    setError(null);
    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
        setTimeout(() => setShowReset(false), 5000);
      } catch (err: any) {
        setError(err.message || "Could not send reset email.");
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
        <Card className="border-primary/10 shadow-2xl bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-3xl font-black uppercase tracking-tight text-primary">
              {showReset ? 'Reset Password' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {showReset 
                ? 'Enter your email to receive a recovery link' 
                : 'Enter your credentials to stream your library'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {!showReset ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit} 
                  className="grid gap-5"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest opacity-70">Email</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        disabled={isPending}
                        className="bg-background/50 h-12 rounded-xl focus-visible:ring-primary/50" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest opacity-70">Password</Label>
                        <button 
                            type="button"
                            onClick={() => setShowReset(true)}
                            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot?
                        </button>
                    </div>
                    <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        disabled={isPending}
                        className="bg-background/50 h-12 rounded-xl focus-visible:ring-primary/50"
                    />
                  </div>
                  
                  {(message || error) && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs font-medium">{message || error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full font-bold h-12 rounded-xl shadow-lg shadow-primary/20" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isPending ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="reset"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword} 
                  className="grid gap-5"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest opacity-70">Account Email</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        disabled={isPending}
                        className="bg-background/50 h-12 rounded-xl" 
                    />
                  </div>
                  
                  {resetSent && (
                    <Alert className="bg-green-500/10 border-green-500/20 text-green-500 rounded-xl">
                        <KeyRound className="h-4 w-4" />
                        <AlertDescription className="text-xs font-medium">Reset link sent! Check your inbox.</AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full font-bold h-12 rounded-xl" disabled={isPending || resetSent}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setShowReset(false)} className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Back to Login
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
            
            {!showReset && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    New to NovaStream?{' '}
                    <Link href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
                        Join now
                    </Link>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
