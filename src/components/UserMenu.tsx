import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useSupabaseLogout } from '@/hooks/useSupabaseLogout';
import { useAuth } from '@/lib/AuthProvider';
import { Beaker, LogOut, Monitor, Moon, Settings, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';

type UserMenuProps = {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
};

export function UserMenu({ align = 'end', side = 'top' }: UserMenuProps) {
  const { user } = useAuth();
  const { logout, isLoggingOut } = useSupabaseLogout();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="User menu"
          data-testid="user-menu-trigger"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-56" data-testid="user-menu-content">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user?.user_metadata?.full_name || 'User'}</span>
            <span className="text-muted-foreground text-xs font-normal">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Settings className="mr-2 size-4" />
          Account preferences
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Beaker className="mr-2 size-4" />
          Feature previews
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="dark">
            <Moon className="mr-2 size-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">
            <Sun className="mr-2 size-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="mr-2 size-4" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <>
              <Spinner className="mr-2 size-4" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 size-4" />
              Log out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
