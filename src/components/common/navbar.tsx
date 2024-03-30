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
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Image from 'next/image';
import { IAccountDetails, User } from '../../../types';
import { useSignOut } from '@/hooks/use-logout';
import Link from 'next/link';
import { Label } from '@radix-ui/react-label';

export function Navbar({ user }: { user: User | null }) {
  const [toasted, setToasted] = useState(false);
  const isDesktop = useMediaQuery('(min-width:768px');
  const router = useRouter();
  const useGetAccountDetails = useQuery({
    queryKey: ['account-details'],
    queryFn: async () => {
      const res = await api.get('/users/account');
      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      return (await res.data.account) as IAccountDetails;
    },
  });
  const signOut = useSignOut();
  if (signOut.isSuccess) {
    router.push('/');
  }
  if (signOut.isError && !toasted) {
    toast({
      title: 'Error',
      description: 'Could not log you out',
      variant: 'destructive',
    });
    setToasted(true);
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b-2 border-gray-300  bg-primary px-2 py-2 text-primary-foreground md:px-16">
      <div className="flex items-center justify-start gap-4">
        <Image src="/logo1.gif" alt="crdsi logo" width={48} height={48} />
        <p className="text-xl font-semibold">CDRSI</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        {user?.role === 'user' && (
          <>
            <Button variant="outline" className="border-border bg-primary text-primary-foreground">
              <Link className="h-full w-full" href="/dashboard">
                Home
              </Link>
            </Button>
            <Button variant="outline" className="border-border bg-primary text-primary-foreground">
              <Link className="h-full w-full" href="/instructions">
                Instructions
              </Link>
            </Button>
            <Button variant="outline" className="border-border bg-primary text-primary-foreground">
              Bookings
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-border bg-primary text-primary-foreground">
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 space-y-3 p-4">
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role !== 'admin' && (
              <Label className=" p-2">
                <strong>Credits</strong> ₹ {useGetAccountDetails.data?.token}
              </Label>
            )}
            <Button
              onClick={() => {
                setToasted(false);
                signOut.mutate();
              }}
              loading={signOut.isPending}
              disabled={signOut.isPending}
            >
              Signout
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>

        {!isDesktop && user?.role !== 'user' && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size={'icon'}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SideBarContent user={user} />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}
