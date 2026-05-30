'use client';

import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface AccountFormProps {
  user: {
    displayName: string | null;
    email: string | null;
  };
}

export function AccountForm({ user }: AccountFormProps) {
  const [name, setName] = useState(user.displayName || '');
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsPending(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });
      toast({
        title: "Profile Updated",
        description: "Your display name has been changed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update profile.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest opacity-60">Display Name</Label>
        <Input 
            id="fullName" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="h-12 bg-background/50 rounded-xl"
            required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</Label>
        <Input 
            id="email" 
            type="email" 
            value={user.email ?? ''} 
            disabled 
            className="h-12 bg-muted/30 rounded-xl opacity-60 border-dashed"
        />
        <p className="text-[10px] text-muted-foreground ml-1">Email changes are locked for security.</p>
      </div>
      <div className="flex items-center justify-between pt-4">
        <Button 
            type="submit" 
            disabled={isPending || name === user.displayName}
            className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
