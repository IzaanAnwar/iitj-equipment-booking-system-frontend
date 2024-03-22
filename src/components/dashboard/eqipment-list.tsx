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
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getSession } from '@/actions/get-session';
import { IEquipment, equipmentData } from './bookings';
import { Badge } from '../ui/badge';

export const columns: ColumnDef<IEquipment>[] = [
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
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
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
        return <div className="">{data}</div>;
      }
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const data = cell.getValue() as string;

      return <Badge variant={data === 'active' ? 'outline' : 'warning'}>{data}</Badge>;
    },
  },
  {
    accessorKey: 'location',
    header: 'Place',
  },
  {
    accessorKey: 'token',
    header: 'Tokens',
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Update</DropdownMenuItem>
            {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function EquipmentList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(true);
  // const useGetEquipments = useQuery({
  //   queryKey: ['get-all-equipments'],
  //   queryFn: async () => {
  //     const res = await api.get('/equipments');
  //     if (res.status !== 200) {
  //       throw new Error('Server Error please try after some time');
  //     }
  //     console.log({ data: await res.data });

  //     return (await res.data.equipments) as Equipment[];
  //   },
  // });

  // if (useGetEquipments.isError && !toasted) {
  //   toast({
  //     title: 'Server error',
  //     variant: 'destructive',
  //   });
  //   setToasted(true);
  // }
  // console.log({ tableDAta: useGetEquipments.data });
  useEffect(() => {
    setTimeout(() => {
      setToasted(false);
    }, 1000);
  }, []);
  if (toasted) {
    return (
      <div className="flex h-full w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  // if (useGetEquipments.data) {
  return (
    <>
      <DataTable
        columns={columns}
        data={equipmentData}
        filters={[
          { val: 'name', type: 'text' },
          { val: 'status', type: 'text' },
        ]}
      />
    </>
  );
  // }
}
