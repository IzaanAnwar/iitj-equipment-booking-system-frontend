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
import { Department, Equipment, IReport, Student, Supervisor, User } from '../../../../types';
import { useState } from 'react';
import { api } from '@/utils/axios-instance';
import { useGetEquipments } from '@/hooks/use-equipments';
import { Badge } from '@/components/ui/badge';
import { ReportList } from './report-table';
import { useQuery } from '@tanstack/react-query';
import { useGetAllSupervisors } from '@/hooks/use-users';
import { SupervisorReportList } from './supervisors-table';
import { DepartmentReportList } from './department-table';

export function SearchAndSelectEquipment({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const [value, setValue] = useState('');
  const [departmentValue, setDepartmentValue] = useState('');
  const [supervisorValue, setSupervisorValue] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>();
  const [selectedDepartment, setSelectedDepartment] = useState<Department>();
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor>();
  const allEquipments = useGetEquipments();
  const allSupervisors = useGetAllSupervisors();
  const allDepartments = useQuery({
    queryKey: ['all-departments'],
    queryFn: async () => {
      const res = await api.get('/users/departments');
      console.log({ res });

      if (res.status === 200) {
        return (await res.data.departments) as Department[];
      } else {
        throw new Error(await res.data);
      }
    },
  });
  console.log({ responseeee: selectedEquipment, selectedDepartment, selectedSupervisor });

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-start gap-8 ">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
              {selectedEquipment ? selectedEquipment.name : 'Select Equipment...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[96vw] p-0 text-base md:w-[50vw] lg:w-[40vw]">
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
                        const item = allEquipments.data.find(
                          (eqipment) => eqipment.name.toLowerCase() === currentValue,
                        );
                        console.log({ equipmentItem: item });
                        setSelectedEquipment(item);
                        setSelectedDepartment(undefined);
                        setSelectedSupervisor(undefined);

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
        <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
              {selectedDepartment ? selectedDepartment.name : 'Select Department...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[96vw] p-0 text-base md:w-[50vw] lg:w-[40vw]">
            <Command>
              <CommandInput placeholder="Search Department..." />
              <CommandEmpty>No Department found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {allDepartments.data?.map((department) => (
                    <CommandItem
                      key={department.id}
                      value={department.name.toLowerCase()}
                      onSelect={(currentValue) => {
                        console.log({ currentValue });

                        setDepartmentValue(currentValue === departmentValue ? '' : currentValue);
                        const item = allDepartments.data.find(
                          (department) => department.name.toLowerCase() === currentValue,
                        );
                        setSelectedDepartment(item);
                        setSelectedSupervisor(undefined);
                        setSelectedEquipment(undefined);
                        console.log({ depa: item });

                        setDepartmentOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          departmentValue === department.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {department.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover open={supervisorOpen} onOpenChange={setSupervisorOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
              {selectedSupervisor ? selectedSupervisor.name : 'Select Supervisor...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[96vw] p-0 text-base md:w-[50vw] lg:w-[40vw]">
            <Command>
              <CommandInput placeholder="Search Supervisor..." />
              <CommandEmpty>No Supervisor found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {allSupervisors.data?.map((supervisor) => (
                    <CommandItem
                      key={supervisor.id}
                      value={supervisor.name.toLowerCase()}
                      onSelect={(currentValue) => {
                        console.log({ currentValue });

                        setSupervisorValue(currentValue === supervisorValue ? '' : currentValue);
                        const item = allSupervisors.data.find(
                          (supervisor) => supervisor.name.toLowerCase() === currentValue,
                        );
                        setSelectedSupervisor(item);
                        setSelectedDepartment(undefined);
                        setSelectedEquipment(undefined);
                        console.log({ item });

                        setSupervisorOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          supervisorValue === supervisor.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
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
      </div>

      <div className="w-full">
        {selectedEquipment && <ReportList id={selectedEquipment.id} user={user} />}
        {selectedSupervisor && <SupervisorReportList id={selectedSupervisor.id} user={user} />}
        {selectedDepartment && <DepartmentReportList id={selectedDepartment.id} user={user} />}
        {!selectedDepartment && !selectedEquipment && !selectedSupervisor && (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Filter Selelcted</h5>
          </div>
        )}
      </div>
    </main>
  );
}

export function SearchAndSelectStudent({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [value, setValue] = useState('');
  const [departmentValue, setDepartmentValue] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department>();
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
  const allDepartments = useQuery({
    queryKey: ['all-departments'],
    queryFn: async () => {
      const res = await api.get('/users/departments');
      console.log({ res });

      if (res.status === 200) {
        return (await res.data.departments) as Department[];
      } else {
        throw new Error(await res.data);
      }
    },
  });
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-start gap-8 ">
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
                        const item = useGetMyStudents.data.find(
                          (student) => student.name.toLowerCase() === currentValue,
                        );
                        setSelectedSudent(item);
                        setSelectedDepartment(undefined);

                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === student.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {student.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
              {selectedDepartment ? selectedDepartment.name : 'Select Department...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[96vw] p-0 text-base md:w-[50vw] lg:w-[40vw]">
            <Command>
              <CommandInput placeholder="Search Department..." />
              <CommandEmpty>No Department found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {allDepartments.data?.map((department) => (
                    <CommandItem
                      key={department.id}
                      value={department.name.toLowerCase()}
                      onSelect={(currentValue) => {
                        console.log({ currentValue });

                        setDepartmentValue(currentValue === departmentValue ? '' : currentValue);
                        const item = allDepartments.data.find(
                          (department) => department.name.toLowerCase() === currentValue,
                        );
                        setSelectedDepartment(item);
                        setSelectedSudent(undefined);
                        console.log({ depa: item });

                        setDepartmentOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          departmentValue === department.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {department.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full">
        {selectedSudent && <ReportList id={selectedSudent.id} user={user} />}
        {selectedDepartment && <DepartmentReportList id={selectedDepartment.id} user={user} />}
        {!selectedDepartment && !selectedSudent && (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Filter Selelcted</h5>
          </div>
        )}
      </div>
    </main>
  );
}
