'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(name.trim(), email.trim(), password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-3 text-5xl">🙏</div>
          <h1 className="text-2xl font-bold text-foreground mb-6">Ganesh Chavithi Fund Manager</h1>
          <Card className="shadow-lg">
            <CardContent className="pt-8 pb-8">
              <CheckCircle2 className="h-14 w-14 text-success mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">
                Account created successfully.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please sign in to continue.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Redirecting to sign in...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl">🙏</div>
          <h1 className="text-2xl font-bold text-foreground">Ganesh Chavithi Fund Manager</h1>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Create Admin Account</CardTitle>
            <CardDescription>Set up your festival committee account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 border-t pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/sign-in')}
                  className="font-medium text-primary hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
