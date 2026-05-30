import { adminAuth } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BackButton } from '@/components/layout/BackButton';
import { cookies } from 'next/headers';
import { AccountForm } from './AccountForm';

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

  const userInitial = user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : '?');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
            <BackButton className="mb-0 border-none bg-muted/50 hover:bg-muted" />
            <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">Profile Settings</h1>
        </div>

        <Card className="border-none shadow-2xl bg-card/30 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b border-white/5">
                <div className='flex items-center gap-6'>
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
                            <AvatarImage src={user.picture} alt={user.email ?? ''} />
                            <AvatarFallback className="text-3xl font-black bg-primary text-white">{userInitial}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-white">Edit</span>
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-black tracking-tighter">{user.name || 'Member'}</CardTitle>
                        <CardDescription className="text-primary font-medium">{user.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
                <AccountForm user={{ displayName: user.name || '', email: user.email || '' }} />
            </CardContent>
        </Card>
    </div>
  );
}
