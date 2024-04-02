'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
  ClipboardIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  ListPlusIcon,
  SquareUserRoundIcon,
  UserPlus2Icon,
  UsersIcon,
} from 'lucide-react';

import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { User } from '../../../types';

export function Sidebar({ user }: { user: User | null }) {
  console.log({ user });

  const isDesktop = useMediaQuery('(min-width:768px');
  if (isDesktop && user?.role !== 'user') {
    return (
      <nav className="sticky  left-0  top-0 min-h-screen border-r-2 border-gray-300 md:w-[25%] lg:w-[22.5%]">
        <h1 className="w-full border-b-2 bg-primary px-4 py-5 text-xl font-bold text-primary-foreground">
          Equipment Booking
        </h1>
        <SideBarContent user={user} />
      </nav>
    );
  }
}

export function SideBarContent({ user }: { user: User | null }) {
  const pathName = usePathname();
  return (
    <div className="mt-12 space-y-4 px-4 ">
      <div>
        <Button className="w-full" variant={pathName.includes('/dashboard') ? 'default' : 'outline'}>
          <Link href="/dashboard" className="flex h-full w-full items-center justify-start gap-2">
            <LayoutDashboardIcon /> <p className="text-base">Dashboard</p>
          </Link>
        </Button>
      </div>
      {user?.role === 'supervisor' ? (
        <div>
          <Button className="w-full" variant={pathName === '/students' ? 'default' : 'outline'}>
            <Link href="/students" className="flex h-full w-full items-center justify-start gap-2">
              <UsersIcon /> <p className="text-base">Students</p>
            </Link>
          </Button>
        </div>
      ) : (
        <div>
          <Button className="w-full" variant={pathName === '/students' ? 'default' : 'outline'}>
            <Link href="/supervisors" className="flex h-full w-full items-center justify-start gap-2">
              <UsersIcon /> <p className="text-base">Supervisors</p>
            </Link>
          </Button>
        </div>
      )}

      <div>
        <Button className="w-full" variant={pathName === '/reports' ? 'default' : 'outline'}>
          <Link href="/reports" className="flex h-full w-full items-center justify-start gap-2">
            <ClipboardIcon /> <p className="text-base">Reports</p>
          </Link>
        </Button>
      </div>
      <div>
        <Button className="w-full" variant={pathName === '/add-user' ? 'default' : 'outline'}>
          <Link href="/add-user" className="flex h-full w-full items-center justify-start gap-2">
            <UserPlus2Icon /> <p className="text-base">Add User</p>
          </Link>
        </Button>
      </div>

      {user?.role === 'admin' && (
        <div>
          <Button className="w-full" variant={pathName === '/add-equipment' ? 'default' : 'outline'}>
            <Link href="/add-equipment" className="flex h-full w-full items-center justify-start gap-2">
              <ListPlusIcon /> <p className="text-base">Add Equipment</p>
            </Link>
          </Button>
        </div>
      )}
      {/* <div>
        <Button className="w-full" variant={pathName === '/account' ? 'default' : 'outline'}>
          <Link href="/account" className="flex h-full w-full items-center justify-start gap-2">
            <SquareUserRoundIcon /> <p className="text-base">Account</p>
          </Link>
        </Button>
      </div> */}
    </div>
  );
}
