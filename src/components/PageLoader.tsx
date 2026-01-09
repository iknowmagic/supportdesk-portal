import { Spinner } from './ui/spinner';

/**
 * PageLoader - Full-page loading spinner
 *
 * Displays a centered spinner to indicate loading state
 * and prevent blank page flashes.
 */
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-background text-foreground dark:text-foreground">
      <Spinner className="h-8 w-8 text-foreground dark:text-foreground" />
    </div>
  );
}
