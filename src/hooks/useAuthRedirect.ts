import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthProvider';

export function useAuthRedirect() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && session) {
      navigate({ to: '/inbox' });
    }
  }, [authLoading, session, navigate]);

  return { authLoading, navigate };
}
