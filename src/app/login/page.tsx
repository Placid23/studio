
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
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
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-white/10 shadow-2xl bg-card/30 backdrop-blur-2xl rounded-[2rem] overflow-hidden border">
          <CardHeader className="space-y-2 pb-8 pt-10 px-8 text-center">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40 mb-4"
            >
                <KeyRound className="text-white w-6 h-6" />
            </motion.div>
            <CardTitle className="text-4xl font-black uppercase tracking-tighter text-foreground">
              {showReset ? 'Recovery' : 'Welcome'}
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              {showReset 
                ? 'Enter email to reset your secret key' 
                : 'Access your premium media library'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {!showReset ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit} 
                  className="grid gap-6"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        disabled={isPending}
                        className="bg-background/40 h-14 rounded-2xl focus-visible:ring-primary/50 border-white/5 transition-all text-lg" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Password</Label>
                        <button 
                            type="button"
                            onClick={() => setShowReset(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot Key?
                        </button>
                    </div>
                    <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        disabled={isPending}
                        className="bg-background/40 h-14 rounded-2xl focus-visible:ring-primary/50 border-white/5 transition-all text-lg"
                    />
                  </div>
                  
                  {(message || error) && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl py-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs font-bold uppercase tracking-tight">{message || error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full font-black h-14 rounded-2xl shadow-xl shadow-primary/20 text-lg uppercase tracking-widest group" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isPending ? 'Validating...' : 'Unlock Stream'}
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="reset"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword} 
                  className="grid gap-6"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Account Email</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        disabled={isPending}
                        className="bg-background/40 h-14 rounded-2xl border-white/5 text-lg" 
                    />
                  </div>
                  
                  {resetSent && (
                    <Alert className="bg-green-500/10 border-green-500/20 text-green-500 rounded-2xl">
                        <KeyRound className="h-4 w-4" />
                        <AlertDescription className="text-xs font-bold uppercase">Reset link sent! Check your inbox.</AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full font-black h-14 rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest" disabled={isPending || resetSent}>
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Send Recovery Link'}
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setShowReset(false)} className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:bg-white/5 rounded-xl">
                        <ArrowLeft className="mr-2 h-3 w-3" /> Back to Login
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
            
            {!showReset && (
                <div className="mt-8 text-center text-sm">
                    <span className="text-muted-foreground font-medium">New to NovaStream?</span>{' '}
                    <Link href="/signup" className="font-black text-primary hover:underline transition-all uppercase tracking-tighter ml-1">
                        Join the crew
                    </Link>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
