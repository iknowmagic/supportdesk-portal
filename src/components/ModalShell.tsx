import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

type CloseComponent = typeof DialogClose | typeof DrawerClose;

type SaveButtonProps = ComponentProps<typeof Button> & {
  "data-testid"?: string;
};

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actionMenu?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hideFooter?: boolean;
  renderFooter?: (ClosePrimitive: CloseComponent) => ReactNode;
  onCancel?: () => void;
  onSave?: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  isSaving?: boolean;
  saveButtonProps?: SaveButtonProps;
}

export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  actionMenu,
  children,
  className,
  contentClassName,
  hideFooter = false,
  renderFooter,
  onCancel,
  onSave,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  isSaving = false,
  saveButtonProps,
}: ModalShellProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const Root = isDesktop ? Dialog : Drawer;
  const Content = isDesktop ? DialogContent : DrawerContent;
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  const Description = isDesktop ? DialogDescription : DrawerDescription;
  const ClosePrimitive = isDesktop ? DialogClose : DrawerClose;

  const defaultFooter = (
    <div className="flex items-center justify-end gap-2 border-t border-border dark:border-border px-6 py-4">
      <ClosePrimitive asChild>
        <Button type="button" variant="ghost" onClick={onCancel} className="dark:text-foreground">
          {cancelLabel}
        </Button>
      </ClosePrimitive>
      <Button type="button" onClick={onSave} disabled={isSaving} className="dark:text-foreground" {...saveButtonProps}>
        {saveLabel}
      </Button>
    </div>
  );

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Content
        className={cn(
          'bg-background dark:bg-background text-foreground dark:text-foreground flex max-h-[600px] flex-col gap-0 overflow-hidden rounded-lg border border-border dark:border-border p-0 sm:w-[500px] sm:max-w-[500px]',
          contentClassName
        )}
        {...(isDesktop ? { showCloseButton: false } : {})}
      >
        <div className={cn('flex h-full min-h-0 flex-col', className)}>
          <header className="flex items-center justify-between px-6 pt-6 pb-4 text-foreground dark:text-foreground">
            <div className="space-y-1">
              <Title className="text-base font-semibold dark:text-foreground">{title}</Title>
              {description && <Description className="text-muted-foreground dark:text-muted-foreground text-sm">{description}</Description>}
            </div>
            <div className="flex items-center gap-2">
              {actionMenu}
              <ClosePrimitive asChild>
                <Button variant="ghost" size="icon" aria-label="Close modal" className="dark:text-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </ClosePrimitive>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">{children}</div>

          {!hideFooter && (renderFooter ? renderFooter(ClosePrimitive) : defaultFooter)}
        </div>
      </Content>
    </Root>
  );
}
