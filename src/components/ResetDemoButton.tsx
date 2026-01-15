import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { resetDemoDatabase } from '@/lib/api/resetDemo';
import { useMutation } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ResetDemoButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const resetMutation = useMutation({
    mutationFn: resetDemoDatabase,
    onSuccess: () => {
      toast.success('Demo data reset');
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to reset demo', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });

  const handleConfirm = () => {
    if (resetMutation.isPending) return;
    resetMutation.mutate();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setDialogOpen(true)}
        disabled={resetMutation.isPending}
        data-testid="reset-demo-button"
      >
        {resetMutation.isPending ? (
          <>
            <Spinner className="size-4" />
            Resetting...
          </>
        ) : (
          <>
            <RotateCcw className="size-4" />
            Reset demo
          </>
        )}
      </Button>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Reset demo data?"
        description="This will wipe the current tickets, comments, and actors and restore the seeded demo data."
        confirmLabel="Reset demo"
        confirmVariant="destructive"
        confirmDisabled={resetMutation.isPending}
        confirmTestId="reset-demo-confirm"
        onConfirm={handleConfirm}
      />
    </>
  );
}
