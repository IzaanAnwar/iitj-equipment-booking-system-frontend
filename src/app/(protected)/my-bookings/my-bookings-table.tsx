'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios-instance';
import { Badge } from '@/components/ui/badge';
import { IReport, User } from '../../../../types';
export const columns: ColumnDef<IReport>[] = [
  {
    accessorKey: 'equipment.name',
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
    accessorKey: 'user.name',
    header: 'User',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = cell.getValue() as 'fulfilled' | 'pending' | 'cancelled';
      if (status === 'fulfilled') {
        return <Badge variant={'active'}>{status}</Badge>;
      }
      if (status === 'pending') {
        return <Badge variant={'warning'}>{status}</Badge>;
      }
      if (status === 'cancelled') {
        return <Badge variant={'destructive'}>{status}</Badge>;
      }
    },
  },
  {
    accessorKey: 'slotTimeStart',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isDesktop = useMediaQuery('(min-width:1000px)');
      if (isDesktop) {
        return <div className="text-center">From</div>;
      }
    },
    cell: ({ cell }) => {
      const data = cell.getValue() as string;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isDesktop = useMediaQuery('(min-width:1000px)');
      if (isDesktop) {
        return <div className="text-center">{moment(data).format('MMMM Do YYYY, h:mm:ss a')}</div>;
      }
    },
  },
  {
    accessorKey: 'slotTimeEnd',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isDesktop = useMediaQuery('(min-width:1000px)');
      if (isDesktop) {
        return <div className="text-center">Till</div>;
      }
    },
    cell: ({ cell }) => {
      const data = cell.getValue() as string;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isDesktop = useMediaQuery('(min-width:1000px)');
      if (isDesktop) {
        return <div className="text-center">{moment(data).format('MMMM Do YYYY, h:mm:ss a')}</div>;
      }
    },
  },
  {
    accessorKey: 'cost',
    header: 'Cost',
  },

  //   {
  //     id: 'actions',
  //     accessorKey: 'action',
  //     header: () => <div className="text-center">Action</div>,
  //     cell: ({ row, cell }) => {
  //       console.log({ row, cell });

  //       const payment = row.original;

  //       return (
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>Edit</DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem>Hello</DropdownMenuItem>
  //             {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       );
  //     },
  //   },
];

export function MyReportList({ id }: { id: string }) {
  const [toasted, setToasted] = useState(true);
  const useGetReport = useQuery({
    queryKey: ['get-my-report'],
    queryFn: async () => {
      const res = await api.get(`/bookings/report/me?userId=${id}`);
      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      return (await res.data.report) as IReport[];
    },
  });

  if (useGetReport.isPending) {
    return (
      <div className="h-full w-full">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }
  if (useGetReport.isError && !toasted) {
    toast({
      title: 'Server error',
      variant: 'destructive',
    });
    setToasted(true);
  }

  if (useGetReport.data) {
    return (
      <>
        <DataTable columns={columns} data={useGetReport.data} />
      </>
    );
  }
}
