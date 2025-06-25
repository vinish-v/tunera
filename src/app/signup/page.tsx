
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation regex: at least one letter, one number, and 6+ characters.
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!passwordRegex.test(password)) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long and include both letters and numbers.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Account Created',
        description: 'Welcome to Tunera! You are now logged in.',
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignup}>
          <CardHeader>
             <CardTitle className="text-2xl flex items-center gap-2">
                <UserPlus/> Create an Account
            </CardTitle>
            <CardDescription>
              Enter your email and password to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Must be 6+ characters and include letters and numbers.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                    Login
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
