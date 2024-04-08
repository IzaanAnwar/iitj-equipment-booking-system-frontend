'use client';
import { useGetAllSupervisors, useGetStudentBySupervisorId } from '@/hooks/use-users';
import { Student, Supervisor, User } from '../../../../../../types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/utils/axios-instance';
import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { CommandList } from 'cmdk';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Modal } from 'antd';
import { Card, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function StudentGrid({ user, supervisorId }: { user: User; supervisorId: string }) {
  const [toasted, setToasted] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor>();
  const [amount, setAmount] = useState<number>();
  const [selectedStudent, setSelectedStudent] = useState<Student>();
  const allSupervisors = useGetAllSupervisors();
  const useTransferStuden = useMutation({
    mutationKey: ['transfer-students'],
    mutationFn: async () => {
      const res = await api.post('/users/students/transfer', {
        studentId: selectedStudent?.id,
        supervisorId: selectedSupervisor?.id,
      });
      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });

      return await res.data;
    },
  });
  const students = useGetStudentBySupervisorId({ supervisorId });
  const useAllotPoints = useMutation({
    mutationKey: ['allot-points'],
    mutationFn: async () => {
      const res = await api.post('users/allot-points', {
        userId: supervisorId,
        amount: amount,
      });
      if (res.status !== 200) {
        throw new Error('Could not allot points to the users');
      }
      return await res.data.message;
    },
  });
  if (students.isPending) {
    return (
      <div className="h-full w-full space-y-4">
        <div className="flex h-full w-full items-center justify-between gap-4">
          <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-[6rem]" />
        </div>
        <div className="flex h-full w-full items-center justify-between gap-4">
          <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-[6rem]" />
        </div>
        <div className="flex h-full w-full items-center justify-between gap-4">
          <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-[6rem]" />
        </div>
      </div>
    );
  }
  if (useTransferStuden.isSuccess && !toasted) {
    toast({
      title: 'Successfully tranfered this student',
      variant: 'success',
    });

    setToasted(true);
    students.refetch();
  }
  if (useAllotPoints.isSuccess && !toasted) {
    toast({
      title: useAllotPoints.data || 'Successfully alloted coins',
      variant: 'success',
    });

    setToasted(true);
    students.refetch();
  }

  return (
    <>
      <div className="w-fit space-y-2 pb-6">
        <Label>Allot Credit Points</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
        <Button
          loading={useAllotPoints.isPending}
          disabled={useAllotPoints.isPending}
          onClick={() => {
            setToasted(false);
            if (!supervisorId) {
              toast({
                title: 'Please select concerend users',
                variant: 'destructive',
              });
              setToasted(true);

              return;
            }
            if (!amount) {
              toast({
                title: 'Please Enter a valid amount',
                variant: 'destructive',
              });
              setToasted(true);
              return;
            }
            useAllotPoints.mutate();
          }}
        >
          Allot
        </Button>
      </div>
      {students.data?.length === 0 ? (
        <Card>
          <CardHeader>No students found</CardHeader>
        </Card>
      ) : (
        <div className="p-4 shadow">
          <div className="grid w-full grid-cols-3 gap-6 border-b-2  pb-4  md:grid-cols-4">
            <>
              <p className="text-lg font-semibold">Name</p>
              <p className="hidden text-lg font-semibold md:block">Email</p>
              <p className="text-lg font-semibold">Departmant</p>
              <p className="ml-auto mr-4 w-fit text-lg font-semibold">Action</p>
            </>
          </div>
          <div className="grid w-full grid-cols-3 gap-6 pt-2 md:grid-cols-4">
            {students.data?.map((student) => {
              return (
                <>
                  <h5 className="">{student.name}</h5>
                  <p className="hidden md:block">{student.email}</p>
                  <p>{student.department?.name}</p>
                  <Button
                    variant="default"
                    loading={useTransferStuden.isPending}
                    disabled={useTransferStuden.isPending}
                    className="ml-auto w-fit"
                    onClick={() => {
                      console.log({ open });

                      setOpen(true);
                      setSelectedStudent(student);
                    }}
                  >
                    Transfer
                  </Button>
                </>
              );
            })}
          </div>
        </div>
      )}
      <div className="absolute h-full w-full">
        <Modal
          className="lg:w-[67vw w-[96vw] p-0 text-base md:w-[72vw]"
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => {
            setToasted(false);
            if (!selectedStudent?.id || !selectedSupervisor?.id) {
              toast({
                title: 'Please select concerend users',
                variant: 'destructive',
              });
              setToasted(true);
              return;
            }
            useTransferStuden.mutate();
            setOpen(false);
          }}
        >
          <Card className="border-none">
            <Command>
              <CommandInput placeholder="Search Equipment..." />
              <CommandEmpty>No Supervisor found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  <ScrollArea className="h-[12rem] ">
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
                          setOpen(true);
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center justify-start gap-2">
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === supervisor.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {supervisor.name}
                        </div>
                        <p>{supervisor.department?.name}</p>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandList>
              </CommandGroup>
            </Command>
          </Card>
        </Modal>
      </div>
    </>
  );
}
