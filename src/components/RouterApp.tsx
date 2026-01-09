import { useAuth } from '@/lib/AuthProvider';
import { router } from '@/routes';
import { RouterProvider } from '@tanstack/react-router';

export function RouterApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}
