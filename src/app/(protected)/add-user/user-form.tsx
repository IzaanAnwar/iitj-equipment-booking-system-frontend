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
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/utils/axios-instance';

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z
    .string({
      required_error: 'Please input an email to display.',
    })
    .email(),

  department: z.string(),
  uin: z.string().optional(),
  userType: z.enum(['user', 'supervisor', 'admin']),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserForm() {
  const [usertype, setUsertype] = useState('');
  const [toasted, setToasted] = useState<boolean>(false);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
  });
  const useAddStudent = useMutation({
    mutationKey: ['add-student'],
    mutationFn: async (data: UserFormValues) => {
      console.log('starting');

      const res = await api.post('/users/students/add', {
        name: data.name,
        email: data.email,
        roll: Number(data.uin),
        department: data.department,
      });
      console.log({ res });

      if (res.status === 201) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });
  const useAddSupervisor = useMutation({
    mutationKey: ['add-supervisor'],
    mutationFn: async (data: UserFormValues) => {
      console.log('starting');

      const res = await api.post('/users/supervisors/add', {
        name: data.name,
        email: data.email,
        department: data.department,
        departmentId: data.uin,
      });
      console.log({ res });

      if (res.status === 201) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });

  const useAddAdmin = useMutation({
    mutationKey: ['add-admin'],
    mutationFn: async (data: UserFormValues) => {
      console.log('starting');

      const res = await api.post('/users/admin/add', {
        name: data.name,
        email: data.email,
        department: data.department,
      });
      console.log({ res });

      if (res.status === 201) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });

  function onSubmit(data: UserFormValues) {
    console.log({ data });
    setToasted(false);
    if (!data || !usertype) {
      toast({
        title: 'Missing Values',
        variant: 'destructive',
      });
    }
    console.log(data);
    if (usertype === 'supervisor') {
      useAddSupervisor.mutate(data);
    } else if (usertype === 'user') {
      useAddStudent.mutate(data);
    } else if (usertype === 'admin') {
      useAddAdmin.mutate(data);
    }
  }
  if (!toasted && useAddSupervisor.isSuccess) {
    toast({
      title: 'Success',
      variant: 'success',
      description: useAddSupervisor.data.message || 'Equipment Added!',
    });
    setToasted(true);
    form.reset();
  }
  if (!toasted && useAddSupervisor.isError) {
    toast({
      title: 'Error',
      variant: 'destructive',
      //@ts-ignore
      description: useAddSupervisor.error?.response?.data?.error?.message || 'Something went wrong',
    });
    setToasted(true);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" className="resize-none" {...field} />
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
                <Input type="text" {...field} />
              </FormControl>
              <FormDescription>Mention Department</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(event) => {
                    setUsertype(event);
                    field.onChange(event);
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Role</SelectLabel>
                      <SelectItem value={'user'}>User</SelectItem>
                      <SelectItem value={'supervisor'}>Supervisor</SelectItem>
                      <SelectItem value={'admin'}>Admin</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select the role of user you want to add</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {!usertype ||
          (usertype !== 'admin' && (
            <FormField
              control={form.control}
              name="uin"
              render={({ field }) => (
                <FormItem className="animate-fade-down animate-duration-200">
                  <FormLabel>{usertype === 'user' ? 'Roll Number' : 'Department Id'}</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>Mention {usertype === 'user' ? 'Roll Number' : 'Department Id'}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

        <Button
          type="submit"
          className="w-full"
          loading={useAddSupervisor.isPending}
          disabled={useAddSupervisor.isPending}
        >
          Add User
        </Button>
      </form>
    </Form>
  );
}
