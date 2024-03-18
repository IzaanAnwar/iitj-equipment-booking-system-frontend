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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
const columnsWithSupervisor: ColumnDef<StudentWithSupervisor>[] = [
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
    accessorKey: 'supervisor.name',
    header: 'Supervisor',
  },

  {
    id: 'actions',
    accessorKey: 'action',
    header: () => <div className="text-center">Action</div>,
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function StudentsList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(false);
  const useGetMyStudents = useQuery({
    queryKey: ['get-supervisors-students'],
    queryFn: async () => {
      if (user.role === 'supervisor') {
        const res = await api.get('/users/students/bySupervisors');
        if (res.status !== 200) {
          throw new Error('Server Error please try after some time');
        }
        console.log({ data: await res.data });

        return (await res.data.students) as Student[];
      }
      if (user.role === 'admin') {
        const res = await api.get('/users/students/all');
        if (res.status !== 200) {
          throw new Error('Server Error please try after some time');
        }
        console.log({ data: await res.data });

        return (await res.data.students) as StudentWithSupervisor[];
      }
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
        // @ts-ignore
        columns={user.role === 'admin' ? columnsWithSupervisor : columns}
        data={useGetMyStudents.data}
        filters={[
          { val: 'name', type: 'text' },
          { val: 'roll', type: 'number' },
        ]}
      />
    );
  }
}
