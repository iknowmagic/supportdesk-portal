import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition - Smooth fade-in animation wrapper
 *
 * Wraps page content with a fade-in animation to prevent
 * abrupt blank page flashes during loading.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full w-full text-foreground dark:text-foreground"
    >
      {children}
    </motion.div>
  );
}
