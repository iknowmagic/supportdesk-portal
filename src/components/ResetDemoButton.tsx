import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { resetDemoDatabase } from '@/lib/api/resetDemo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TimerReset } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ResetDemoButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: resetDemoDatabase,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['actors'] }),
      ]);
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
        size="icon"
        aria-label="Reset demo data"
        onClick={() => setDialogOpen(true)}
        disabled={resetMutation.isPending}
        data-testid="reset-demo-button"
      >
        {resetMutation.isPending ? (
          <Spinner className="size-4" />
        ) : (
          <TimerReset className="size-4" />
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
