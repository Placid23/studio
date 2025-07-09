import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';

function SupabaseError() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Supabase Misconfigured</h1>
        <p className="mt-2 text-destructive/80">Could not connect to the database. Please ensure your Supabase URL and Key are configured correctly in your environment variables.</p>
      </div>
    </div>
  )
}

export default async function AccountPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SupabaseError />;
  }
  
  let user;
  try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        return redirect('/login?message=You must be logged in to view your account.');
      }
      user = data.user;
  } catch(e) {
      return <SupabaseError />;
  }

  const userInitial = user.email ? user.email[0].toUpperCase() : '?';

  return (
    <div className="container mx-auto px-4 py-8">
        <BackButton />
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.user_metadata.avatar_url} alt={user.email ?? ''} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">Account Settings</CardTitle>
                        <CardDescription>Manage your account details.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={user.user_metadata.full_name ?? ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={user.email ?? ''} disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="createdAt">Account Created</Label>
                        <Input id="createdAt" value={new Date(user.created_at).toLocaleDateString()} disabled />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button disabled>Save Changes</Button>
                        <p className="text-sm text-muted-foreground self-center ml-4">Editing is disabled for this demo.</p>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
