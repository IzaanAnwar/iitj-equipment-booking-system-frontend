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

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios-instance';
import { Equipment, User } from '../../../types';
import { Skeleton } from '../ui/skeleton';
import { toast } from '../ui/use-toast';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { useGetEquipments } from '@/hooks/use-get-equipments';

export const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ cell }) => {
      const data = cell.getValue() as string;

      return <div className="ml-4">{data}</div>;
    },
  },

  {
    accessorKey: 'description',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isDesktop = useMediaQuery('(min-width:1000px)');
      if (isDesktop) {
        return <div className="text-center">Description</div>;
      }
    },
    cell: ({ cell }) => {
      const data = cell.getValue() as string;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isDesktop = useMediaQuery('(min-width:1000px)');
      if (isDesktop) {
        return <div className="text-center">{data}</div>;
      }
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return <Badge variant={status === 'active' ? 'active' : 'warning'}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'place',
    header: 'Place',
  },
  {
    accessorKey: 'tokens',
    header: 'Tokens',
  },

  {
    id: 'actions',
    accessorKey: 'action',
    header: () => <div className="text-center">Action</div>,
    cell: ({ row, cell }) => {
      console.log({ row, cell });

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/update-equipment/${row.original.id}`}>Update Status</Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function EquipmentList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(true);
  const allEquipments = useGetEquipments();

  if (allEquipments.isError && !toasted) {
    toast({
      title: 'Server error',
      variant: 'destructive',
    });
    setToasted(true);
  }
  console.log({ tableDAta: allEquipments.data });

  if (allEquipments.isPending) {
    return (
      <div className="flex h-full w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (allEquipments.data) {
    return (
      <>
        <DataTable
          columns={columns}
          data={allEquipments.data}
          filters={[
            { val: 'name', type: 'text' },
            { val: 'status', type: 'text' },
          ]}
        />
      </>
    );
  }
}
