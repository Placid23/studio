
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
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
        setError("Secret key must be at least 6 characters.");
        return;
    }

    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
        setSuccess(true);
        setTimeout(() => {
            router.push('/');
            router.refresh();
        }, 1500);
      } catch (err: any) {
        let errorMsg = "Could not initiate membership. Try again.";
        if (err.code === 'auth/email-already-in-use') {
            errorMsg = "This email is already in the system.";
        } else if (err.code === 'auth/invalid-email') {
            errorMsg = "Invalid email format.";
        }
        setError(errorMsg);
      }
    });
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-accent/20 rounded-full blur-[130px] animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[130px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-white/10 shadow-2xl bg-card/30 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border">
          <CardHeader className="space-y-2 pb-8 pt-10 px-8 text-center">
             <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="mx-auto w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6"
            >
                <Sparkles className="text-white w-7 h-7" />
            </motion.div>
            <CardTitle className="text-4xl font-black uppercase tracking-tighter text-foreground">Join Nova</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Create your credentials to start streaming</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-12">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Account Email</Label>
                <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    disabled={isPending || success} 
                    className="bg-background/40 h-14 rounded-2xl border-white/5 text-lg focus-visible:ring-primary/50 transition-all"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
                <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••"
                    required 
                    disabled={isPending || success} 
                    className="bg-background/40 h-14 rounded-2xl border-white/5 text-lg focus-visible:ring-primary/50 transition-all"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2 mt-1">Minimum 6 characters required.</p>
              </div>
              
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/30 bg-green-500/10 text-green-500 rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-xs font-bold uppercase">Account created! Deploying stream...</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full font-black h-14 rounded-2xl shadow-xl shadow-primary/20 text-lg uppercase tracking-widest transition-transform active:scale-95" disabled={isPending || success}>
                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isPending ? 'Initiating...' : 'Secure Membership'}
              </Button>
            </form>
            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground font-medium">Already have an account?</span>{' '}
              <Link href="/login" className="font-black text-primary hover:underline transition-all uppercase tracking-tighter ml-1">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
