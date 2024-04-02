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
import { Student, StudentWithSupervisor, User } from '../../../types';
import { Skeleton } from '../ui/skeleton';
import { toast } from '../ui/use-toast';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';

const columns: ColumnDef<Student>[] = [
  //   {
  //     id: 'select',
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
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
    accessorKey: 'roll',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Roll
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ cell }) => {
      const data = cell.getValue() as string;

      return <div className="pl-4">{data}</div>;
    },
  },

  {
    id: 'actions',
    accessorKey: 'action',
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <div className="mx-auto w-fit">
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
                <Link href={`/students/transfer/${row.original.id}`} className="w-full">
                  Transfer
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function StudentsList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(false);
  const useGetMyStudents = useQuery({
    queryKey: ['get-supervisors-students'],
    queryFn: async () => {
      const res = await api.get('/users/students/bySupervisors');
      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });

      return (await res.data.students) as Student[];
    },
  });

  if (useGetMyStudents.isPending) {
    return (
      <div className="flex h-full w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (useGetMyStudents.isError && !toasted) {
    toast({
      title: 'Server error',
      variant: 'destructive',
    });
    setToasted(true);
  }
  console.log({ tableDAta: useGetMyStudents.data });

  if (useGetMyStudents.data) {
    return (
      <DataTable
        columns={columns}
        data={useGetMyStudents.data}
        filters={[
          { val: 'name', type: 'text' },
          { val: 'roll', type: 'number' },
        ]}
      />
    );
  }
}
