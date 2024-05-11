'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import moment from 'moment';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios-instance';
import { Badge } from '@/components/ui/badge';
import { IReport, Supervisor, User } from '../../../../types';
('use client');
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommandList } from 'cmdk';

import { useGetAllSupervisors } from '@/hooks/use-users';

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
        return <div className="text-center">{moment(data).format('MMMM Do YYYY, HH:mm:ss')}</div>;
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
        return <div className="text-center">{moment(data).format('MMMM Do YYYY, HH:mm:ss')}</div>;
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

export function ReportList({ id, user }: { id: string; user: User }) {
  const [toasted, setToasted] = useState(true);
  const useGetReport = useQuery({
    queryKey: ['get-report'],
    queryFn: async () => {
      if (user.role === 'admin') {
        const res = await api.get(`/bookings/report?id=${id}`);
        if (res.status !== 200) {
          throw new Error(await res.data);
        }
        return (await res.data.report) as IReport[];
      }
      if (user.role === 'supervisor') {
        const res = await api.get(`/bookings/report/students?studentId=${id}`);
        if (res.status !== 200) {
          throw new Error(await res.data);
        }
        return (await res.data.report) as IReport[];
      }
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

export function SearchAndSelectFaculty({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor>();
  const allSupervisors = useGetAllSupervisors();
  return (
    <main className="space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
            {selectedSupervisor ? selectedSupervisor.name : 'Select Student...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[96vw] p-0 text-base md:w-[72vw] lg:w-[67vw]">
          <Command>
            <CommandInput placeholder="Search Equipment..." />
            <CommandEmpty>No Student found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {allSupervisors.data?.map((supervisor) => (
                  <CommandItem
                    key={supervisor.id}
                    value={supervisor.name.toLowerCase()}
                    onSelect={(currentValue) => {
                      console.log({ currentValue });

                      setValue(currentValue === value ? '' : currentValue);
                      const item = allSupervisors.data.find(
                        (supervisor) => supervisor.name.toLowerCase() === currentValue,
                      );
                      setSelectedSupervisor(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === supervisor.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {supervisor.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="w-full">
        {selectedSupervisor ? (
          <ReportList id={selectedSupervisor.id} user={user} />
        ) : (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Student Selelcted</h5>
          </div>
        )}
      </div>
    </main>
  );
}
