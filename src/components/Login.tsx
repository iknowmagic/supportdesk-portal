import { PageLoader } from '@/components/PageLoader';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && session) {
      navigate({ to: '/' });
    }
  }, [authLoading, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Please check your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <PageTransition>
      <div className="bg-background dark:bg-background text-foreground dark:text-foreground flex min-h-screen items-center justify-center p-4">
        <div className={cn('flex w-full max-w-sm flex-col gap-6')}>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="bg-primary/10 dark:bg-primary/20 flex size-12 items-center justify-center rounded-lg">
                  <Inbox className="text-primary dark:text-primary size-7" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-foreground dark:text-foreground text-2xl font-bold">InboxHQ Demo</h1>
                  <FieldDescription className="dark:text-muted-foreground">
                    Sign in with demo credentials
                  </FieldDescription>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <FieldDescription className="dark:text-muted-foreground bg-muted/50 dark:bg-muted/20 rounded-md p-3 text-center text-xs">
            <strong>Demo Credentials:</strong>
            <br />
            Email: demo@example.com
            <br />
            Password: {import.meta.env.VITE_DEMO_USER_PASSWORD || '(see .env)'}
          </FieldDescription>
        </div>
      </div>
    </PageTransition>
  );
}
