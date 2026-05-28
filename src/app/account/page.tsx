import { adminAuth } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { cookies } from 'next/headers';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;

  if (!token) {
    return redirect('/login?message=You must be logged in to view your account.');
  }
  
  let user;
  try {
      user = await adminAuth.verifyIdToken(token);
  } catch(e) {
      return redirect('/login?message=Session expired. Please login again.');
  }

  const userInitial = user.email ? user.email[0].toUpperCase() : '?';

  return (
    <div className="container mx-auto px-4 py-8">
        <BackButton />
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.picture} alt={user.email ?? ''} />
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
                        <Label htmlFor="fullName">Name</Label>
                        <Input id="fullName" value={user.name || user.email?.split('@')[0] || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={user.email ?? ''} disabled />
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
