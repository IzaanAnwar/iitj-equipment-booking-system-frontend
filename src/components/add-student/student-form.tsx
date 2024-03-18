'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { api } from '@/utils/axios-instance';

const studentFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z
    .string({
      required_error: 'Please input an email to display.',
    })
    .email(),

  roll: z.string(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export function StudentForm() {
  const [toasted, setToasted] = useState<boolean>(false);
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    mode: 'onChange',
  });

  const useAddStudent = useMutation({
    mutationKey: ['add-student'],
    mutationFn: async (data: StudentFormValues) => {
      console.log('starting');

      const res = await api.post('/users/students/add', {
        name: data.name,
        email: data.email,
        roll: Number(data.roll),
      });
      console.log({ res });

      if (res.status === 201) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });

  function onSubmit(data: StudentFormValues) {
    setToasted(false);
    if (!data) {
      toast({
        title: 'Missing Values',
        variant: 'destructive',
      });
    }
    console.log(data);

    useAddStudent.mutate(data);
  }
  if (!toasted && useAddStudent.isSuccess) {
    toast({
      title: 'Success',
      variant: 'success',
      description: useAddStudent.data.message || 'Equipment Added!',
    });
    setToasted(true);
  }
  if (!toasted && useAddStudent.isError) {
    toast({
      title: 'Error',
      variant: 'destructive',
      //@ts-ignore
      description: useAddStudent.error?.response?.data?.error?.message || 'Something went wrong',
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
              <FormLabel>Student Name</FormLabel>
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
          name="roll"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll number</FormLabel>
              <FormControl>
                <Input type="number" placeholder="eg: 1" {...field} />
              </FormControl>
              <FormDescription>Input student&apos;s roll number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" loading={useAddStudent.isPending} disabled={useAddStudent.isPending}>
          Add Student
        </Button>
      </form>
    </Form>
  );
}
