
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuth, ProtectedRoute } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function AccountPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center p-4 sm:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-primary" />
            My Account
          </CardTitle>
          <CardDescription>
            View and manage your account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 font-semibold">
                    <Mail className="w-4 h-4" /> Email Address
                </Label>
                <Input id="email" type="email" value={user?.email || ''} readOnly disabled />
            </div>
            <Separator/>
            <div>
                <h3 className="text-lg font-semibold mb-2">Subscription</h3>
                <p className="text-sm text-muted-foreground">
                    You are currently on the Free plan. Subscription management will be available here soon.
                </p>
            </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function AccountPage() {
    return (
        <ProtectedRoute>
            <AccountPageContent />
        </ProtectedRoute>
    )
}
