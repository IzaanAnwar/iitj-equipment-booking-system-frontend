'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Student, Supervisor, User } from '../../../../../../types';
import { api } from '@/utils/axios-instance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllSupervisors, useGetStudent } from '@/hooks/use-users';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { CommandList } from 'cmdk';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function TransferStudentCard({ studentId, user }: { studentId: string; user: User }) {
  const router = useRouter();
  const [toasted, setToasted] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor>();

  const useTransferStuden = useMutation({
    mutationKey: ['transfer-students'],
    mutationFn: async () => {
      const res = await api.post('/users/students/transfer', {
        studentId: studentId,
        supervisorId: selectedSupervisor?.id,
      });
      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });
    },
  });
  const student = useGetStudent({ studentId });
  const allSupervisors = useGetAllSupervisors(user.userId!);
  if (allSupervisors.isPending || student.isPending) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  console.log({ allSupervisors });

  if ((allSupervisors.isError || student.isError) && !toasted) {
    toast({
      title: 'Something went wrong',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useTransferStuden.isError && !toasted) {
    toast({
      title: 'Could not tranfer this student',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useTransferStuden.isSuccess && !toasted) {
    toast({
      title: 'Successfully tranfered this student',
      variant: 'success',
    });

    setToasted(true);
    router.push('/dashboard/students');
  }
  return (
    allSupervisors.data && (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Transfer {student.data?.name} </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between text-base"
                >
                  {selectedSupervisor ? selectedSupervisor.name : 'Select Supervisor...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[96vw] p-0 text-base md:w-[72vw] lg:w-[67vw]">
                <Command>
                  <CommandInput placeholder="Search Equipment..." />
                  <CommandEmpty>No Supervisor found.</CommandEmpty>
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
                            setSelectedSupervisor(supervisor);
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
            {selectedSupervisor?.id && (
              <div className="pt-6">
                <div className="w-full space-y-4">
                  <p>Supervisor&apos;s Information</p>
                  <h5>
                    <strong>Name</strong>: {selectedSupervisor.name}
                  </h5>
                  <h5>
                    <strong>Department</strong>: {selectedSupervisor.department}
                  </h5>
                  <Button
                    onClick={() => {
                      setToasted(false);

                      if (!selectedSupervisor.id) {
                        toast({
                          title: 'Please select a valid supervisor',
                          variant: 'destructive',
                        });
                        setToasted(true);
                      }
                      useTransferStuden.mutate();
                    }}
                    loading={useTransferStuden.isPending}
                    disabled={useTransferStuden.isPending}
                  >
                    Trasfer
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  );
}
