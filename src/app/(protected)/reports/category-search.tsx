'use client';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommandList } from 'cmdk';
import { Equipment, IReport, Student, Supervisor, User } from '../../../../types';
import { useState } from 'react';
import { api } from '@/utils/axios-instance';
import { useGetEquipments } from '@/hooks/use-equipments';
import { Badge } from '@/components/ui/badge';
import { ReportList } from './report-table';
import { useQuery } from '@tanstack/react-query';
import { useGetAllSupervisors } from '@/hooks/use-users';

export function SearchAndSelectEquipment({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>();
  const allEquipments = useGetEquipments();
  return (
    <main className="space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
            {selectedEquipment ? selectedEquipment.name : 'Select Equipment...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[96vw] p-0 text-base md:w-[72vw] lg:w-[67vw]">
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
          <ReportList id={selectedEquipment.id} user={user} />
        ) : (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Equipment Selelcted</h5>
          </div>
        )}
      </div>
    </main>
  );
}

export function SearchAndSelectStudent({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedSudent, setSelectedSudent] = useState<Student>();
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
  return (
    <main className="space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
            {selectedSudent ? selectedSudent.name : 'Select Student...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[96vw] p-0 text-base md:w-[72vw] lg:w-[67vw]">
          <Command>
            <CommandInput placeholder="Search Equipment..." />
            <CommandEmpty>No Student found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {useGetMyStudents.data?.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.name.toLowerCase()}
                    onSelect={(currentValue) => {
                      console.log({ currentValue });

                      setValue(currentValue === value ? '' : currentValue);
                      const item = useGetMyStudents.data.find((student) => student.name.toLowerCase() === currentValue);
                      setSelectedSudent(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4', value === student.name.toLowerCase() ? 'opacity-100' : 'opacity-0')}
                    />
                    {student.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="w-full">
        {selectedSudent ? (
          <ReportList id={selectedSudent.id} user={user} />
        ) : (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Student Selelcted</h5>
          </div>
        )}
      </div>
    </main>
  );
}
