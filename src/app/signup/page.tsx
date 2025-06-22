import Link from 'next/link';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Signup({ searchParams }: { searchParams: { message: string } }) {
  const signUp = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const origin = headers().get('origin');
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect(`/signup?message=Could not create account: ${error.message}`);
    }

    return redirect('/signup?message=Check your email to continue the sign up process');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {searchParams.message && (
                <Alert variant={searchParams.message.startsWith('Check your email') ? 'default' : 'destructive'}>
                    {searchParams.message.startsWith('Check your email') 
                      ? <CheckCircle2 className="h-4 w-4" /> 
                      : <AlertTriangle className="h-4 w-4" />
                    }
                    <AlertTitle>{searchParams.message.startsWith('Check your email') ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{searchParams.message}</AlertDescription>
                </Alert>
            )}
            <Button formAction={signUp} className="w-full">
              Create an account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
