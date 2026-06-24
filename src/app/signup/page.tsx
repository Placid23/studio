'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, CheckCircle2, Sparkles, MapPin, User, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useState, useTransition } from 'react';

export default function Signup() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationData, setLocationData] = useState<{ city?: string; country: string } | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                // Using a simple reverse geocoding approach or just coordinate storage
                // For MVP we'll just show coordinates or "Detected"
                setLocationData({ country: "Auto-Detected Region" });
                setLocationLoading(false);
            } catch (e) {
                setLocationLoading(false);
            }
        },
        () => {
            setError("Location access denied.");
            setLocationLoading(false);
        }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const country = formData.get('country') as string;

    setError(null);

    if (password.length < 6) {
        setError("Secret key must be at least 6 characters.");
        return;
    }

    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile
        await updateProfile(user, { displayName: fullName });

        // Store additional info in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            fullName,
            country: country || locationData?.country || 'Unknown',
            email,
            createdAt: Date.now(),
            location: locationData ? 'precise' : 'manual'
        });

        const token = await user.getIdToken();
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
        }
        setError(errorMsg);
      }
    });
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 overflow-hidden py-20">
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-accent/20 rounded-full blur-[130px] animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[130px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <Card className="border-white/10 shadow-2xl bg-card/30 backdrop-blur-3xl rounded-[3rem] overflow-hidden border">
          <CardHeader className="space-y-2 pb-8 pt-12 px-10 text-center">
             <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6"
            >
                <Sparkles className="text-white w-8 h-8" />
            </motion.div>
            <CardTitle className="text-5xl font-black uppercase tracking-tighter text-foreground italic">Join Nova</CardTitle>
            <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Tier-1 Membership Registration</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-16">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                        <User className="w-3 h-3" /> Full Name
                    </Label>
                    <Input 
                        id="fullName" 
                        name="fullName" 
                        placeholder="John Doe" 
                        required 
                        disabled={isPending || success} 
                        className="bg-background/40 h-14 rounded-2xl border-white/5 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center justify-between">
                        <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Country</span>
                        <button type="button" onClick={handleDetectLocation} className="text-primary hover:underline text-[9px] lowercase tracking-normal">Detect automatically</button>
                    </Label>
                    <Input 
                        id="country" 
                        name="country" 
                        placeholder="United States" 
                        defaultValue={locationData?.country}
                        required 
                        disabled={isPending || success || locationLoading} 
                        className="bg-background/40 h-14 rounded-2xl border-white/5 focus-visible:ring-primary"
                    />
                  </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Account Email
                </Label>
                <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    disabled={isPending || success} 
                    className="bg-background/40 h-14 rounded-2xl border-white/5 text-lg focus-visible:ring-primary"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Secret Password
                </Label>
                <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••"
                    required 
                    disabled={isPending || success} 
                    className="bg-background/40 h-14 rounded-2xl border-white/5 text-lg focus-visible:ring-primary"
                />
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2 mt-1">Tier-1 Encryption Guaranteed.</p>
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
                    <AlertDescription className="text-xs font-bold uppercase">Membership Authorized. Deploying...</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full font-black h-16 rounded-[1.5rem] shadow-2xl shadow-primary/20 text-xl uppercase tracking-widest group transition-all active:scale-95 bg-primary hover:bg-primary/90 mt-4" disabled={isPending || success}>
                {isPending && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                {isPending ? 'Validating...' : 'Secure Access'}
              </Button>
            </form>
            <div className="mt-10 text-center text-sm">
              <span className="text-muted-foreground font-medium">Already recognized by the system?</span>{' '}
              <Link href="/login" className="font-black text-primary hover:underline transition-all uppercase tracking-tighter ml-1">
                Return to Port
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
