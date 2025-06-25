
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">
              Login to Tunera
            </CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
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
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                    Sign up
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
