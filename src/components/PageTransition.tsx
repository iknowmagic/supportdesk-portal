import { AnimatePresence, motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string;
}

/**
 * PageTransition - Smooth fade-in animation wrapper
 *
 * Wraps page content with a fade-in animation to prevent
 * abrupt blank page flashes during loading.
 */
export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const resolvedTransitionKey = transitionKey ?? 'route';
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={resolvedTransitionKey}
        data-testid="page-transition"
        data-transition-key={resolvedTransitionKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-full w-full text-foreground dark:text-foreground"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
