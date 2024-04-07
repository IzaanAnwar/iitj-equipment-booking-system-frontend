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

import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios-instance';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';
import { Supervisor, User } from '../../../../types';
import { useGetAllSupervisors } from '@/hooks/use-users';
import { toast } from '@/components/ui/use-toast';

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
    accessorKey: 'department.name',
    header: 'Department',
  },

  {
    id: 'actions',
    accessorKey: 'action',
    header: () => <div className="text-left">Action</div>,
    cell: ({ row }) => {
      const payment = row.original;

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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function SupervisorList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(false);
  const allSupervisors = useGetAllSupervisors();

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
  console.log({ tableDAta: allSupervisors.data });

  if (allSupervisors.data) {
    return (
      <DataTable
        // @ts-ignore
        columns={columns}
        data={allSupervisors.data}
        filters={[
          { val: 'name', type: 'text' },
          { val: 'roll', type: 'number' },
        ]}
      />
    );
  }
}
