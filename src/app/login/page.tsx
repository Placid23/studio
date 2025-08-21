
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
import { createClient } from '@/lib/supabase/client';
import { useTransition } from 'react';


export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [isPending, startTransition] = useTransition();

  const signIn = (formData: FormData) => {
    startTransition(async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          router.push('/login?message=Supabase is not configured.');
          return;
      }

      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        router.push(`/login?message=Could not authenticate user: ${error.message}`);
        return;
      }

      router.push('/');
      router.refresh();
    });
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader>
            <motion.div variants={itemVariants} custom={0}>
                <CardTitle className="text-2xl">Login</CardTitle>
            </motion.div>
            <motion.div variants={itemVariants} custom={1}>
                <CardDescription>Enter your email below to login to your account</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form action={signIn} className="grid gap-4">
              <motion.div variants={itemVariants} custom={2} className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isPending} />
              </motion.div>
              <motion.div variants={itemVariants} custom={3} className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required disabled={isPending} />
              </motion.div>
              
              {message && (
                <motion.div variants={itemVariants} custom={4}>
                  <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={itemVariants} custom={5}>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? 'Logging in...' : 'Login'}
                </Button>
              </motion.div>
            </form>
            <motion.div variants={itemVariants} custom={6} className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
