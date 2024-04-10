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
import { useCancelBooking } from '@/hooks/use-equipments';
import { DownloadReport } from './download-report';

export function DepartmentReportList({ id, user }: { id: string; user: User }) {
  const [toasted, setToasted] = useState(true);
  console.log({ departmentIddd: id });

  const useGetReport = useQuery({
    queryKey: [id],
    queryFn: async () => {
      const res = await api.get(`/bookings/report/department?departmentId=${id}`);
      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      const data = (await res.data.report) as IReport[];
      if (user.role === 'supervisor') {
        const filteredData = data.filter((item) => item.supervisorId === user.userId);
        return filteredData;
      }
      return data;
    },
  });
  const cancelBooking = useCancelBooking();

  const columns: ColumnDef<IReport>[] = [
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
      header: ({ column }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const isDesktop = useMediaQuery('(min-width:1000px)');
        if (isDesktop) {
          return (
            <div className="flex w-full items-center justify-center">
              <Button
                variant={'ghost'}
                className="text-center"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                From
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          );
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

    {
      id: 'actions',
      accessorKey: 'action',
      header: () => user.role === 'admin' && <div className="text-center">Action</div>,

      cell: ({ row, cell }) => {
        console.log({ row, cell });
        if (user.role === 'admin') {
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
                <DropdownMenuItem>
                  <Button
                    className="w-full"
                    disabled={row.original.status === 'pending' ? false : true}
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setToasted(false);
                      cancelBooking.mutate({ id: row.original.id });
                    }}
                  >
                    Cancel
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      },
    },
  ];
  if (useGetReport.isPending) {
    return (
      <div className="h-full min-h-[50vh] w-full ">
        <Skeleton className="min-h-[50vh] w-full  bg-primary/15" />
      </div>
    );
  }
  if (cancelBooking.isPending) {
    return (
      <div className="h-full min-h-[50vh] w-full ">
        <Skeleton className="min-h-[50vh] w-full  bg-primary/15" />
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
  if (cancelBooking.isError && !toasted) {
    toast({
      title: 'Failed',
      // @ts-ignore
      description: cancelBooking.error?.response?.data?.message || 'Could not cancel the selected booking',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (cancelBooking.isSuccess && !toasted) {
    toast({
      title: 'Success',
      description: 'Booking cancelled successfully',
      variant: 'success',
    });
    useGetReport.refetch();
    setToasted(true);
  }
  if (useGetReport.data) {
    return (
      <div className="h-full w-full animate-fade-down animate-duration-200">
        <h5 className="py-1 text-lg font-semibold">Department Report</h5>
        <DownloadReport reports={useGetReport.data} />
        <DataTable
          columns={columns}
          data={useGetReport.data}
          filters={[
            { val: 'status', type: 'text' },
            { val: 'user_name', type: 'text' },
            { val: 'equipment_name', type: 'text' },
          ]}
        />
      </div>
    );
  }
}
