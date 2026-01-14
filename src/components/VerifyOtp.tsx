import { PageLoader } from '@/components/PageLoader';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function VerifyOtpPage() {
  const { authLoading, navigate } = useAuthRedirect();
  const search = useSearch({ strict: false });
  const email = (search as { email?: string }).email;

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect back to login if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('No email provided', {
        description: 'Please start the login process from the beginning.',
      });
      navigate({ to: '/login' });
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      toast.success('Welcome!', {
        description: "You've been logged in successfully.",
      });

      // Navigation will happen automatically via onAuthStateChange in AuthProvider
      // The router's auth guard will redirect to "/" after session is established
    } catch (error) {
      toast.error('Invalid code', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
      setOtp(''); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      toast.success('Code resent', {
        description: `We've sent a new 6-digit code to ${email}`,
      });
    } catch (error) {
      toast.error('Failed to resend code', {
        description: error instanceof Error ? error.message : 'Please try again.',
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className={cn('flex w-full max-w-sm flex-col gap-6')}>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Enter the 6-digit code we sent to
                  <br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="otp" className="sr-only">
                  Verification code
                </FieldLabel>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isLoading} autoFocus>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <FieldDescription className="text-center">Check your email for the verification code</FieldDescription>
              </Field>

              <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full">
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify code'
                )}
              </Button>

              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" onClick={handleResend} disabled={isLoading} className="w-full">
                  Resend code
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate({ to: '/login' })}
                  disabled={isLoading}
                  className="w-full"
                >
                  Use a different email
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
