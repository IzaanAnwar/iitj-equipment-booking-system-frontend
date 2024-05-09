'use client';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios-instance';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';
import { Supervisor, User } from '../../../../types';
import { useGetAllSupervisors } from '@/hooks/use-users';
import { toast } from '@/components/ui/use-toast';

export function SupervisorList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(false);
  const [open, setopen] = useState(false);
  const [selUser, setSelUser] = useState<string>('');
  const allSupervisors = useGetAllSupervisors();
  const suspendUser = useMutation({
    mutationKey: ['suspend-user'],
    mutationFn: async (userId: string) => {
      const res = await api.post('/users/suspend', {
        id: userId,
      });
      if (res.status !== 200) {
        throw new Error(res.data);
      }
      return res.data;
    },
  });

  const columns: ColumnDef<Supervisor>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const isDesktop = useMediaQuery('(min-width:1000px)');
        if (isDesktop) {
          return <div className="text-left">Email</div>;
        }
      },
      cell: ({ cell }) => {
        const data = cell.getValue() as string;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const isDesktop = useMediaQuery('(min-width:1000px)');
        if (isDesktop) {
          return <div className="">{data}</div>;
        }
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
    },
    {
      accessorKey: 'department.name',
      header: 'Department',
    },

    {
      id: 'actions',
      accessorKey: 'action',
      header: () => <div className="text-left">Action</div>,
      cell: ({ row }) => {
        const data = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/supervisors/manage/${row.original.id}`}>Manage</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  size={'sm'}
                  onClick={() => {
                    setSelUser(data.id);
                    setopen(true);
                  }}
                  className="w-full"
                  variant={'destructive'}
                >
                  Remove
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (allSupervisors.isPending) {
    return (
      <div className="flex h-full w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (allSupervisors.isError && !toasted) {
    toast({
      title: 'Server error',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (suspendUser.isSuccess && !toasted) {
    toast({
      title: 'Removed',
    });
    setToasted(true);
  }
  if (suspendUser.isError && !toasted) {
    toast({
      title: 'Error',
      // @ts-ignore
      description: suspendUser?.error?.response?.data?.message || 'Internal Server Error',
      variant: 'destructive',
    });
    setToasted(true);
  }

  if (allSupervisors.data) {
    return (
      <>
        <AlertDialog open={open} onOpenChange={(state) => setopen(state)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete supervisor&apos;s account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  suspendUser.mutate(selUser);
                  allSupervisors.refetch();
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DataTable
          // @ts-ignore
          columns={columns}
          data={allSupervisors.data}
          filters={[
            { val: 'name', type: 'text' },
            { val: 'department_name', type: 'text' },
          ]}
        />
      </>
    );
  }
}
