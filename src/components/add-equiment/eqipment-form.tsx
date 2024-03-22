'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import { TimePicker } from 'antd';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { api } from '@/utils/axios-instance';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';

const equipmentFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z
    .string({
      required_error: 'Please write a description to display.',
    })
    .min(16, {
      message: 'Name must be at least 16 characters.',
    }),
  cost: z.string(),
  place: z.string(),
  availablity: z.string(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export function EquipmentForm() {
  const [toasted, setToasted] = useState<boolean>(false);
  const [closeWeekSelector, setCloseWeekSelector] = useState<boolean>(false);
  const [closeTimeSelector, setCloseTimeSelector] = useState<boolean>(false);
  const [weekDaySelect, setWeekDaySelect] = useState({
    Monday: false,

    Tuesday: false,

    Wednesday: false,

    Thursday: false,

    Friday: false,

    Saturday: false,

    Sunday: false,
  });
  const [timeSelect, setTimeSelect] = useState<{ [key: string]: boolean }>({});

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    mode: 'onChange',
  });

  const useAddEquipment = useMutation({
    mutationKey: ['add-equipment'],
    mutationFn: async (data: EquipmentFormValues) => {
      const res = await api.post('/equipments/add', {
        name: data.name,
        description: data.description,
        cost: Number(data.cost),
      });
      if (res.status === 201) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });

  function onSubmit(data: EquipmentFormValues) {
    setToasted(false);
    if (!data) {
      toast({
        title: 'Missing Values',
        variant: 'destructive',
      });
      return;
    }

    useAddEquipment.mutate(data);
  }
  if (!toasted && useAddEquipment.isSuccess) {
    toast({
      title: 'Success',
      variant: 'success',
      description: useAddEquipment.data.message || 'Equipment Added!',
    });
    setToasted(true);
  }

  if (!toasted && useAddEquipment.isError) {
    console.log({ err: useAddEquipment.error });
    toast({
      title: 'Error',
      variant: 'destructive',
      // @ts-ignore
      description: useAddEquipment?.error?.response.data.message || 'Could not add the equipment!',
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
              <FormLabel>Equipment Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Write something about the equipment" className="resize-none" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place</FormLabel>
              <FormControl>
                <Textarea placeholder="Location of Lab" className="resize-none" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consumable Charges per slot/sample</FormLabel>
              <FormControl>
                <Input type="number" placeholder="eg: 1" {...field} />
              </FormControl>
              <FormDescription>Input the consumable Charges that are required to book this equipment</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availablity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hour/Slot</FormLabel>
              <FormControl>
                {/* <div className="w-full items-center justify-between gap-4 space-y-2 md:flex md:space-y-0"> */}
                {/* <DropdownMenu open={closeWeekSelector}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={() => setCloseWeekSelector(true)}>
                        Select Days
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Days</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {WEEKDAYS.map((day, i) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={i}
                            checked={weekDaySelect[day as WeekDay]}
                            onCheckedChange={(val) => {
                              setWeekDaySelect({
                                ...weekDaySelect,
                                [day]: val,
                              });
                            }}
                          >
                            {day}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                      <DropdownMenuSeparator />
                      <div className="flex w-full items-center justify-center pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-6"
                          onClick={() => {
                            console.log({ weekDaySelect, val: form.getValues() });

                            setCloseWeekSelector(false);
                          }}
                        >
                          Done
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Equipment slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Equipment slot</SelectLabel>
                      <SelectItem value={'60'}>1 hr</SelectItem>
                      <SelectItem value={'120'}>2 hr</SelectItem>
                      <SelectItem value={'180'}>3 hr</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* </div> */}
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availablity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lab Hours</FormLabel>
              <FormControl>
                <TimePicker.RangePicker
                  format={'hh-mm'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>

              <FormDescription>Select Lab Hours (Monday to Friday)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          loading={useAddEquipment.isPending}
          disabled={useAddEquipment.isPending}
        >
          Add Equipment
        </Button>
      </form>
    </Form>
  );
}
