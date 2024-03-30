'use client';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommandList } from 'cmdk';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { Equipment, IReport } from '../../../../types';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios-instance';
import { useGetEquipments } from '@/hooks/use-equipments';

export function SearchAndSelectEquipment() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>();
  const allEquipments = useGetEquipments();
  return (
    <main className="space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedEquipment ? selectedEquipment.name : 'Select Equipment...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[96vw] p-0 md:w-[72vw] lg:w-[67vw]">
          <Command>
            <CommandInput placeholder="Search Equipment..." />
            <CommandEmpty>No Equipment found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {allEquipments.data?.map((eqipment) => (
                  <CommandItem
                    key={eqipment.id}
                    value={eqipment.name.toLowerCase()}
                    onSelect={(currentValue) => {
                      console.log({ currentValue });

                      setValue(currentValue === value ? '' : currentValue);
                      const item = allEquipments.data.find((eqipment) => eqipment.name.toLowerCase() === currentValue);
                      setSelectedEquipment(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === eqipment.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {eqipment.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="w-full">
        {selectedEquipment ? (
          <ReportList id={selectedEquipment.id} />
        ) : (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Equipment Selelcted</h5>
          </div>
        )}
      </div>
    </main>
  );
}

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
    accessorKey: 'slotDuration',
    header: 'Duration',
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
    accessorKey: 'equipment.tokens',
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
            <DropdownMenuItem>Hello</DropdownMenuItem>
            {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function ReportList({ id }: { id: string }) {
  const [toasted, setToasted] = useState(true);
  const useGetReport = useQuery({
    queryKey: ['get-report'],
    queryFn: async () => {
      const res = await api.get(`/bookings/report?id=${id}`);
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
