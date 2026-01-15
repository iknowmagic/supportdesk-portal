import { AppShell } from '@/components/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ComponentsShowcasePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [volume, setVolume] = useState([50]);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">shadcn/ui + theme + Jotai-ready</p>
            <h1 className="text-2xl font-semibold">Components Showcase</h1>
          </div>
          <Badge variant="outline">Light/Dark friendly</Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>Inputs, select, checkbox, switch, slider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="you@example.com" />
              </div>

              <div className="grid gap-2">
                <Label>Plan</Label>
                <Select defaultValue="pro">
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Subscribe to newsletter</p>
                  <p className="text-muted-foreground text-xs">Stay up to date</p>
                </div>
                <Switch checked={newsletter} onCheckedChange={setNewsletter} />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox id="agree" />
                <Label htmlFor="agree" className="text-sm">
                  I agree to the terms
                </Label>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <span>Volume</span>
                  <span>{volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dialogs & Menus</CardTitle>
              <CardDescription>Dialog, dropdown, tooltip</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Heads up</DialogTitle>
                    <DialogDescription>This dialog demonstrates layered surfaces.</DialogDescription>
                  </DialogHeader>
                  <p className="text-muted-foreground text-sm">Use dialogs for confirmations or focused tasks.</p>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Dropdown</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>Tooltips stay crisp in dark/light.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Date & Command</CardTitle>
            <CardDescription>Calendar popover and command palette</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Pick a date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                  >
                    {date ? format(date, 'PPP') : 'Select a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Command palette</Label>
              <Command className="rounded-lg border">
                <CommandInput placeholder="Search…" />
                <CommandList>
                  <CommandEmpty>No results.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>Dashboard</CommandItem>
                    <CommandItem>Components</CommandItem>
                    <CommandItem>Settings</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scrollable content</CardTitle>
            <CardDescription>ScrollArea with separators</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40 rounded border p-4">
              <div className="text-muted-foreground space-y-3 text-sm">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-foreground font-medium">Item {i + 1}</div>
                    <p>Scrollable content block to show consistent scrollbar styling.</p>
                    {i < 7 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabs Layout</CardTitle>
            <CardDescription>Tabs within a card</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="one">
              <TabsList>
                <TabsTrigger value="one">One</TabsTrigger>
                <TabsTrigger value="two">Two</TabsTrigger>
                <TabsTrigger value="three">Three</TabsTrigger>
              </TabsList>
              <TabsContent value="one" className="text-muted-foreground pt-4 text-sm">
                Content one
              </TabsContent>
              <TabsContent value="two" className="text-muted-foreground pt-4 text-sm">
                Content two
              </TabsContent>
              <TabsContent value="three" className="text-muted-foreground pt-4 text-sm">
                Content three
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
