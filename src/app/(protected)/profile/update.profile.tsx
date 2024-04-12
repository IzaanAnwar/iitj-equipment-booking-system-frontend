'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/utils/axios-instance';
import { Department, IAccountDetails, User } from '../../../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const userDetailsFormSchema = z.object({
  department: z.string().optional(),
  uin: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type UserFormValues = z.infer<typeof userDetailsFormSchema>;

export function UpdateProfile({ user }: { user: User }) {
  const [toasted, setToasted] = useState<boolean>(false);
  const [departemntName, setDepartmentName] = useState<string>('');
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userDetailsFormSchema),
    mode: 'onChange',
  });
  const useAllDepartment = useQuery({
    queryKey: ['all-departments'],
    queryFn: async () => {
      const res = await api.get('/users/departments');

      if (res.status === 200) {
        return (await res.data.departments) as Department[];
      } else {
        throw new Error(await res.data);
      }
    },
  });
  const useGetAccountDetails = useQuery({
    queryKey: ['account-details'],
    queryFn: async () => {
      const res = await api.get('/users/account');

      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      return (await res.data.account) as IAccountDetails;
    },
  });
  const useUpdateDetails = useMutation({
    mutationKey: ['update-student'],
    mutationFn: async (data: UserFormValues) => {
      const res = await api.post('/users/update', {
        phone: data.phone,
        address: data.address,
        roll: data.uin ? parseInt(data.uin) : 0,
        departmentId: data.department,
      });

      if (res.status === 200) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });
  const useAddDepartment = useMutation({
    mutationKey: ['add-department'],
    mutationFn: async () => {
      const res = await api.post('/users/department/add', {
        name: departemntName,
      });

      if (res.status === 201) {
        return await res.data;
      } else {
        throw new Error(await res.data);
      }
    },
  });

  function onSubmit(data: UserFormValues) {
    setToasted(false);
    if (!data) {
      toast({
        title: 'Missing Values',
        variant: 'destructive',
      });
    }
    useUpdateDetails.mutate(data);
  }
  if (useAllDepartment.isPending || useGetAccountDetails.isPending) {
    return (
      <div className="flex h-full w-full  items-center justify-center  ">
        <Skeleton className="h-full min-h-[50vh] w-full" />
      </div>
    );
  }

  if ((useAllDepartment.isError || useGetAccountDetails.isError) && !toasted) {
    toast({
      title: 'Server error',
      description: 'could not fetch user details',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useUpdateDetails.isError && !toasted) {
    toast({
      title: 'Oops',
      // @ts-ignore
      description: useUpdateDetails.error?.response?.data.message || 'could not fetch user details',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useAddDepartment.isError && !toasted) {
    toast({
      title: 'Oops',
      // @ts-ignore
      description: useAddDepartment.error?.response?.data.message || 'could not add department',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useUpdateDetails.isSuccess && !toasted) {
    toast({
      title: 'Suuccessfully updated',
      variant: 'success',
    });
    setToasted(true);
  }
  if (useAddDepartment.isSuccess && !toasted) {
    toast({
      title: 'Suuccessfully added',
      variant: 'success',
    });
    setToasted(true);
    useAllDepartment.refetch();
  }

  return (
    <main className="space-y-12 px-2 py-12 text-[1rem] md:px-20 lg:px-40">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-start gap-4">
              <Label className="font-bold">Name</Label>
              <h5>{useGetAccountDetails.data?.name}</h5>
            </div>
            <div className="flex items-center justify-start gap-4">
              <Label className="font-bold">Phone</Label>
              <h5>{useGetAccountDetails.data?.phone || 'NA'}</h5>
            </div>
            <div className="flex items-center justify-start gap-4">
              <Label className="font-bold">Email</Label>
              <h5>{useGetAccountDetails.data?.email}</h5>
            </div>
            <div className="flex items-center justify-start gap-4">
              <Label className="font-bold">Address</Label>
              <h5>{useGetAccountDetails.data?.address || 'NA'}</h5>
            </div>
            {user.role !== 'admin' && (
              <div className="flex items-center justify-start gap-4">
                <Label className="font-bold">Department</Label>
                <h5>{useGetAccountDetails.data?.department?.name}</h5>
              </div>
            )}
            {user.role !== 'admin' && (
              <div className="flex items-center justify-start gap-4">
                <Label className="font-bold">Credits</Label>
                <h5>{useGetAccountDetails.data?.token}</h5>
              </div>
            )}
            {user.role !== 'admin' && (
              <div className="flex items-center justify-start gap-4">
                <Label className="font-bold">{user.role === 'user' ? 'Roll' : 'UID '}</Label>
                <h5>{user.role === 'user' ? useGetAccountDetails.data?.roll : useGetAccountDetails.data?.uid}</h5>
              </div>
            )}
            {user.role === 'user' && (
              <div className="flex items-center justify-start gap-4">
                <Label className="font-bold">Supervisor</Label>
                <h5>{useGetAccountDetails.data?.supervisor?.name}</h5>
              </div>
            )}
          </CardContent>
        </Card>
        {user.role === 'admin' && (
          <Card className="h-full w-full px-2 py-3.5">
            <CardContent className="space-y-2">
              <Label className="font-bold">Add Department</Label>
              <Input
                placeholder="departemnt name"
                value={departemntName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                loading={useAddDepartment.isPending}
                disabled={useAddDepartment.isPending}
                onClick={() => {
                  setToasted(false);
                  if (!departemntName) {
                    toast({
                      title: 'Department Missing',
                      variant: 'destructive',
                    });
                    return;
                  }
                  useAddDepartment.mutate();
                }}
              >
                Add
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Update Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {useAllDepartment.data?.map((dep) => {
                            return (
                              <SelectItem key={dep.id} value={dep.id}>
                                {dep.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Mention Department</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="address" {...field} />
                    </FormControl>
                    <FormDescription>Mention Department</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {user.role !== 'admin' && (
                <FormField
                  control={form.control}
                  name="uin"
                  render={({ field }) => (
                    <FormItem className="animate-fade-down animate-duration-200">
                      <FormLabel>{user.role === 'user' ? 'Roll Number' : 'Department Id'}</FormLabel>
                      <FormControl>
                        <Input type={user.role === 'user' ? 'number' : 'text'} {...field} />
                      </FormControl>
                      <FormDescription>
                        Mention {user.role === 'user' ? 'Roll Number' : 'Department Id'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="w-full"
                loading={useUpdateDetails.isPending}
                disabled={useUpdateDetails.isPending}
              >
                Update Details
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
