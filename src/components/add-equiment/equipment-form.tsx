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

const slotSchema = z.object({
  type: z.enum(['DAY', 'EVENING', 'NIGHT']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

const equipmentFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string({
    required_error: 'Please write a description to display.',
  }),
  place: z.string(),
  cost: z.string(),
  slot: z.string(),
  equipmentTime: z.array(slotSchema).optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export function EquipmentForm() {
  const [toasted, setToasted] = useState<boolean>(false);
  const [slots, setSlots] = useState(['DAY']);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showNightPicker, setShowNightPicker] = useState(false);
  const [equipmentSlots, setEquipmentSlots] = useState<
    { type: string; startTime: string | undefined | null; endTime: string | undefined | null }[] | {}[]
  >([]);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    mode: 'onChange',
  });
  function handleAddSlot(type: 'DAY' | 'EVE' | 'NIGHT') {
    if (type === 'DAY') {
      setSlots([...slots, 'DAY']);
      setShowDayPicker(true);
    } else if (type === 'EVE') {
      setSlots([...slots, 'EVENING']);
      setShowEveningPicker(true);
    } else if (type === 'NIGHT') {
      setSlots([...slots, 'NIGHT']);
      setShowNightPicker(true);
    }
  }

  function removeSlot(type: 'DAY' | 'EVE' | 'NIGHT') {
    if (type === 'DAY') {
      setSlots(['DAY']);
      setShowDayPicker(false);
      setEquipmentSlots((prevSlots) => {
        const updatedSlots = [...prevSlots];

        updatedSlots[0] = {};
        return updatedSlots;
      });
    } else if (type === 'EVE') {
      setSlots(['DAY']);
      setShowEveningPicker(false);
      setEquipmentSlots((prevSlots) => {
        const updatedSlots = [...prevSlots];

        updatedSlots[1] = {};
        return updatedSlots;
      });
    } else if (type === 'NIGHT') {
      setSlots(['DAY', 'EVENING']);
      setShowNightPicker(false);
      setEquipmentSlots((prevSlots) => {
        const updatedSlots = [...prevSlots];

        updatedSlots[2] = {};
        return updatedSlots;
      });
    }
  }

  const useAddEquipment = useMutation({
    mutationKey: ['add-equipment'],
    mutationFn: async (data: EquipmentFormValues) => {
      const res = await api.post('/equipments/add', {
        name: data.name,
        description: data.description,
        cost: Number(data.cost),
        place: data.place,
        slot: Number(data.slot),
        equipmentSlots: equipmentSlots,
      });
      console.log({ res });

      if (res.status === 201) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });

  function onSubmit(data: EquipmentFormValues) {
    console.log({ data, equipmentSlots });
    {
      console.log({ equipmentSlots });
    }
    setToasted(false);
    if (!data) {
      toast({
        title: 'Missing Values',
        variant: 'destructive',
      });
      return;
    }
    if (!equipmentSlots || (equipmentSlots && equipmentSlots.length < 1)) {
      toast({
        title: 'Invalid Lab Hours',
        variant: 'destructive',
      });
    }

    useAddEquipment.mutate(data);
  }
  if (!toasted && useAddEquipment.isSuccess) {
    toast({
      title: 'Success',
      variant: 'success',
      description: useAddEquipment.data?.message || 'Equipment Added!',
    });
    setToasted(true);
    form.reset({ cost: '', description: '', equipmentTime: [], name: '', place: '', slot: '' });
  }

  if (!toasted && useAddEquipment.isError) {
    console.log({ err: useAddEquipment.error });
    toast({
      title: 'Error',
      variant: 'destructive',
      // @ts-ignore
      description: useAddEquipment?.error?.response?.data?.message || 'Could not add the equipment!',
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
          name="slot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hour/Slot</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Equipment slot" />
                  </SelectTrigger>
                  <SelectContent
                    {...field}
                    onChange={(val) => {
                      console.log({ val });
                    }}
                  >
                    <SelectGroup>
                      <SelectLabel>Select Equipment slot</SelectLabel>
                      <SelectItem value={'60'}>1 hr</SelectItem>
                      <SelectItem value={'120'}>2 hr</SelectItem>
                      <SelectItem value={'180'}>3 hr</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="equipmentTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lab Hours</FormLabel>
              <FormControl>
                <>
                  <div className="flex w-full items-center justify-between gap-4">
                    {showDayPicker && (
                      <TimePicker.RangePicker
                        format={'hh-mm'}
                        onSelectCapture={field.onChange}
                        onChange={(val) => {
                          console.log({ val: val[0]?.format('hh:mm') });

                          setEquipmentSlots((prevSlots) => {
                            const updatedSlots = [...prevSlots];

                            updatedSlots[0] = {
                              ...updatedSlots[0],
                              type: 'DAY',
                              startTime: val[0]?.format('HH:MM'),
                              endTime: val[1]?.format('HH:MM'),
                            };
                            return updatedSlots;
                          });
                        }}
                        className="btn-style flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                    {showDayPicker ? (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => removeSlot('DAY')}
                        variant="destructive"
                        className="animate-fade-right animate-duration-200"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleAddSlot('DAY')}
                        className="w-full animate-fade-left animate-duration-200"
                        variant="outline"
                      >
                        Add Day Slot
                      </Button>
                    )}
                  </div>
                  <div className="flex w-full items-center justify-between gap-4">
                    {showEveningPicker && (
                      <TimePicker.RangePicker
                        format={'hh-mm'}
                        onChange={(val) => {
                          setEquipmentSlots((prevSlots) => {
                            const updatedSlots = [...prevSlots!];
                            updatedSlots[1] = {
                              ...updatedSlots[1],
                              type: 'EVENING',
                              startTime: val[0]?.format('HH:MM'),
                              endTime: val[1]?.format('HH:MM'),
                            };
                            return updatedSlots;
                          });
                        }}
                        className="btn-style flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                    {showEveningPicker ? (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => removeSlot('EVE')}
                        variant="destructive"
                        className="animate-fade-right animate-duration-200"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleAddSlot('EVE')}
                        className="w-full animate-fade-left animate-duration-200"
                        variant="outline"
                      >
                        Add Evening Slot
                      </Button>
                    )}
                  </div>

                  <div className="flex w-full items-center justify-between gap-4">
                    {showNightPicker && (
                      <TimePicker.RangePicker
                        format={'hh-mm'}
                        onChange={(val) => {
                          setEquipmentSlots((prevSlots) => {
                            const updatedSlots = [...prevSlots!];
                            updatedSlots[2] = {
                              ...updatedSlots[2],
                              type: 'NIGHT',
                              startTime: val[0]?.format('HH:MM'),
                              endTime: val[1]?.format('HH:MM'),
                            };
                            return updatedSlots;
                          });
                        }}
                        className="btn-style flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                    {showNightPicker ? (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => removeSlot('NIGHT')}
                        variant="destructive"
                        className="animate-fade-right animate-duration-200"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleAddSlot('NIGHT')}
                        className="w-full animate-fade-left animate-duration-200"
                        variant="outline"
                      >
                        Add Night Slot
                      </Button>
                    )}
                  </div>
                </>
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
