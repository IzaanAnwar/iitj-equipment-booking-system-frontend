'use client';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { SideBarContent } from './sidebar';
import { MenuIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { api } from '@/utils/axios-instance';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export function Navbar() {
  const [toasted, setToasted] = useState(false);
  const isDesktop = useMediaQuery('(min-width:768px');
  const router = useRouter();
  const useSignOut = useMutation({
    mutationKey: ['signout'],
    mutationFn: async () => {
      try {
        const res = await api.post('/signout');
        console.log({ res });

        if (res.status !== 200) {
          throw new Error('Something went wrong');
        }
      } catch (error) {
        console.error({ error });
      }
    },
  });
  if (useSignOut.isSuccess) {
    router.push('/');
  }
  if (useSignOut.isSuccess && !toasted) {
    toast({
      title: 'Error',
      description: 'Could not log you out',
      variant: 'destructive',
    });
    setToasted(true);
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b-2 bg-background px-2 py-2 md:px-16 lg:px-32">
      <div>IIT</div>
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="/domr" />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-4">
            <DropdownMenuLabel>User</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Button
              onClick={() => {
                setToasted(false);
                useSignOut.mutate();
              }}
              loading={useSignOut.isPending}
              disabled={useSignOut.isPending}
            >
              Signout
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        {!isDesktop && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size={'icon'}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SideBarContent />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}
