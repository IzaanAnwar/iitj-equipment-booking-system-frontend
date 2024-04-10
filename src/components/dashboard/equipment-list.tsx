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

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios-instance';
import { Equipment, User } from '../../../types';
import { Skeleton } from '../ui/skeleton';
import { toast } from '../ui/use-toast';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { useGetEquipments } from '@/hooks/use-equipments';

export function EquipmentList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(true);
  const allEquipments = useGetEquipments();
  const removeEquipment = useMutation({
    mutationKey: ['remove'],
    mutationFn: async ({ id }: { id: string }) => {
      const res = await api.post('/equipments/remove', {
        equipmentId: id,
      });
      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      return await res.data;
    },
  });
  const columns: ColumnDef<Equipment>[] = [
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
          return <div className="text-center md:max-w-[28rem] lg:max-w-[32rem] xl:w-full ">Description</div>;
        }
      },
      cell: ({ cell }) => {
        const data = cell.getValue() as string;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const isDesktop = useMediaQuery('(min-width:1000px)');
        if (isDesktop) {
          return <div className="text-left  md:max-w-[28rem] lg:max-w-[32rem] xl:w-full">{data}</div>;
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
      cell: ({ cell }) => {
        const data = cell.getValue() as string;
        return <div className="w-full text-left">{data}</div>;
      },
    },
    // {
    //   accessorKey: 'tokens',
    //   header: 'Tokens',
    // },

    {
      id: 'actions',
      accessorKey: 'action',
      header: () => <div className="text-left">Action</div>,
      cell: ({ row, cell }) => {
        console.log({ row, cell });

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
                  className=""
                  variant={'destructive'}
                  size={'sm'}
                  disabled={row.original.status === 'retired'}
                  onClick={() => {
                    setToasted(false);
                    if (!row.original.id) {
                      toast({
                        title: 'Oops',
                        description: 'Can not delete this equipment',
                        variant: 'destructive',
                      });
                      setToasted(true);
                    }
                    removeEquipment.mutate({ id: row.original.id });
                  }}
                >
                  Remove from service
                </Button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/dashboard/update-equipment/${row.original.id}`} className="h-full w-full">
                  Update Status
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  if (allEquipments.isError && !toasted) {
    toast({
      title: 'Server error',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (removeEquipment.isError && !toasted) {
    toast({
      title: 'Oops',
      // @ts-ignore
      description: removeEquipment.error?.response?.data?.message || 'We were not able to delete this equipment!',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (removeEquipment.isSuccess && !toasted) {
    toast({
      title: 'Success',
      description: 'Successfully removed the equipment',
      variant: 'success',
    });
    setToasted(true);
    allEquipments.refetch();
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
