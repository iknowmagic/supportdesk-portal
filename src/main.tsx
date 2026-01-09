import { RouterApp } from '@/components/RouterApp';
import { Toaster } from '@/components/ui/sonner';
import { Provider as QueryProvider } from '@/integrations/tanstack-query/root-provider';
import { AuthProvider } from '@/lib/AuthProvider';
import '@/lib/clearSupabaseStorage'; // Expose clearSupabaseStorage() to window for dev tools
// import { DevTools } from 'jotai-devtools';
// import 'jotai-devtools/styles.css';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeWatcher } from './components/ThemeWatcher';
import { toast as sonnerToast } from 'sonner';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <ThemeWatcher />
      <QueryProvider>
        <AuthProvider>
          <RouterApp />
          <Toaster
            closeButton
            toastOptions={{
              closeButton: true,
              className: 'cursor-pointer',
              // @ts-expect-error sonner supports onClick on toast options even if not typed
              onClick: (toast) => {
                if (toast?.id !== undefined) sonnerToast.dismiss(toast.id);
              },
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
    {/* <DevTools /> */}
  </StrictMode>
);
