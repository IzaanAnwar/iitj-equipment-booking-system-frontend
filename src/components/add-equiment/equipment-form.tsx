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
import { useCallback, useState } from 'react';
import { api } from '@/utils/axios-instance';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Dayjs } from 'dayjs';

const slotSchema = z.object({
  type: z.enum(['DAY', 'EVENING', 'NIGHT']),
  cost: z.string(),
  slotDuration: z.number().optional(),
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
  slot: z.string(),
  equipmentTime: z.array(slotSchema).optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export function EquipmentForm() {
  const [toasted, setToasted] = useState<boolean>(false);
  const [slots, setSlots] = useState(['DAY']);
  const [disableMorningEnd, setDisableMorningEnd] = useState<number>(0);
  const [disableDayStart, setDisableDayStart] = useState<number>(24);
  const [disableDayEnd, setDisableDayEnd] = useState<number>(0);
  const [disableEveStart, setDisableEveStart] = useState<number>(24);
  const [disableEveEnd, setDisableEveEnd] = useState<number>(24);
  const [disableNightStart, setDisableNightStart] = useState<number>(0);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showNightPicker, setShowNightPicker] = useState(false);
  const [equipmentSlots, setEquipmentSlots] = useState<
    {
      type: string;
      startTime: string | undefined | null;
      endTime: string | undefined | null;
      duration: string;
    }[]
  >([]);
  const [daySlotCost, setDaySlotCost] = useState<number>();
  const [morningSlotCost, setMorningSlotCost] = useState<number>();
  const [eveningSlotCost, setEveningSlotCost] = useState<number>();
  const [nightSlotCost, setNightSlotCost] = useState<number>();
  // const [daySlotDuration,setDaySlotDuration]

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    mode: 'onChange',
  });
  function handleAddSlot(type: 'MORNING' | 'DAY' | 'EVE' | 'NIGHT') {
    if (type === 'MORNING') {
      setSlots([...slots, 'MORNING']);
      setShowMorningPicker(true);
    } else if (type === 'DAY') {
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

  function removeSlot(type: 'MORNING' | 'DAY' | 'EVE' | 'NIGHT') {
    if (type === 'MORNING') {
      setSlots(['MORNING']);
      setShowMorningPicker(false);
      const newState = equipmentSlots.filter((slotInfo) => slotInfo.type === 'MORNING');
      setEquipmentSlots(newState);
    } else if (type === 'DAY') {
      setSlots(['MORNING']);
      setShowDayPicker(false);
      const newState = equipmentSlots.filter((slotInfo) => slotInfo.type === 'DAY');
      setEquipmentSlots(newState);
    } else if (type === 'EVE') {
      setSlots(['MORNING', 'DAY']);
      setShowEveningPicker(false);
      const newState = equipmentSlots.filter((slotInfo) => slotInfo.type === 'EVENING');
      setEquipmentSlots(newState);
    } else if (type === 'NIGHT') {
      setSlots(['MORNING', 'DAY', 'EVENING']);
      setShowNightPicker(false);
      const newState = equipmentSlots.filter((slotInfo) => slotInfo.type === 'NIGHT');
      setEquipmentSlots(newState);
    }
  }

  const useAddEquipment = useMutation({
    mutationKey: ['add-equipment'],
    mutationFn: async (data: EquipmentFormValues) => {
      const equimentSlotCategories: {
        type: string;
        cost: number;
        startTime: string;
        endTime: string;
        duration: number;
      }[] = [];
      for (const category of equipmentSlots) {
        let cost: number | undefined = 0;
        if (category.type === 'MORNING') {
          cost = morningSlotCost;
        } else if (category.type === 'DAY') {
          cost = daySlotCost;
        } else if (category.type === 'EVENING') {
          cost = eveningSlotCost;
        } else if (category.type === 'NIGHT') {
          cost = nightSlotCost;
        }
        if (category && category?.type) {
          equimentSlotCategories.push({
            type: category.type,
            cost: cost || 0,
            duration: parseInt(category.duration),
            startTime: category.startTime!,
            endTime: category.endTime!,
          });
        }
      }
      console.log({
        name: data.name,
        description: data.description,
        place: data.place,
        slot: Number(data.slot),
        equipmentSlots: equimentSlotCategories,
      });

      const res = await api.post('/equipments/add', {
        name: data.name,
        description: data.description,
        place: data.place,
        slot: Number(data.slot),
        equipmentSlots: equimentSlotCategories,
      });
      console.log({ res });

      if (res.status === 201) {
        return (await res.data) as { equipmentId: string; message: string };
      } else {
        throw new Error(await res.data);
      }
    },
  });
  console.log({ equipmentSlots });

  const disabledTimeMorning = useCallback(
    (current: Dayjs) => {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < 24; i++) {
            if (i < 0 || i > disableDayStart) {
              hours.push(i);
            }
          }
          return hours;
        },
      };
    },
    [disableDayStart],
  );
  const disabledTimeDay = useCallback(
    (current: Dayjs) => {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < 24; i++) {
            if (i < disableMorningEnd || i > disableEveStart) {
              hours.push(i);
            }
          }
          return hours;
        },
      };
    },
    [disableEveStart, disableMorningEnd],
  );
  const disabledTimeEvening = useCallback(
    (current: Dayjs) => {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < 24; i++) {
            24;
            if (i < disableDayEnd || i > disableEveEnd) {
              hours.push(i);
            }
          }
          return hours;
        },
      };
    },
    [disableDayEnd, disableEveEnd],
  );
  const disabledTimeNight = useCallback(
    (current: Dayjs) => {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < 24; i++) {
            if (i < disableNightStart || i > 24) {
              hours.push(i);
            }
          }
          return hours;
        },
      };
    },
    [disableNightStart],
  );

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
      return;
    }
    let isErr: boolean = false;
    equipmentSlots.forEach((sl) => {
      if (!sl.endTime || !sl.startTime || !sl.type || !sl.duration) {
        isErr = true;
      }
    });
    if (isErr) {
      toast({
        title: 'You missed to determine lab hours for one or more slots type',
        variant: 'destructive',
      });
      return;
    }

    equipmentSlots.forEach((sl) => {
      const startHour = sl?.startTime?.split(':')[0];
      const endHour = sl?.endTime?.split(':')[0];
      if (startHour && endHour) {
        if (parseInt(startHour) === parseInt(endHour) || parseInt(startHour) > parseInt(endHour)) {
          toast({
            title: 'Invalid Slots Configuration selected',
            variant: 'destructive',
          });
          return;
        }
      }
    });
    useAddEquipment.mutate(data);
  }
  if (!toasted && useAddEquipment.isSuccess) {
    toast({
      title: 'Success',
      variant: 'success',
      description: useAddEquipment.data?.message || 'Equipment Added!',
    });
    setToasted(true);
    form.reset({ description: '', equipmentTime: [], name: '', place: '', slot: '' });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
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
        {/* <FormField
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
        /> */}

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
                      console.log({ tome: val });
                    }}
                  >
                    <SelectGroup>
                      <SelectLabel>Select Equipment slot</SelectLabel>
                      <SelectItem value={'1'}>1 hr</SelectItem>
                      <SelectItem value={'2'}>2 hr</SelectItem>
                      <SelectItem value={'3'}>3 hr</SelectItem>
                      <SelectItem value={'4'}>4 hr</SelectItem>
                      <SelectItem value={'5'}>5 hr</SelectItem>
                      <SelectItem value={'6'}>6 hr</SelectItem>
                      <SelectItem value={'7'}>7 hr</SelectItem>
                      <SelectItem value={'8'}>8 hr</SelectItem>
                      <SelectItem value={'9'}>9 hr</SelectItem>
                      <SelectItem value={'10'}>10 hr</SelectItem>
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
                  <div className="space-y-3 rounded border px-2 py-4">
                    {showMorningPicker && <Label className="block w-full">Early Morning Slot Slot</Label>}

                    <div className="space-y-2">
                      {showMorningPicker && (
                        <Select
                          onValueChange={(val) => {
                            setEquipmentSlots((prevSlots) => {
                              const updatedSlots = [...prevSlots];

                              updatedSlots[0] = {
                                ...updatedSlots[0],
                                duration: val,
                              };
                              return updatedSlots;
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Equipment slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Select Equipment slot</SelectLabel>
                              <SelectItem value={'1'}>1 hr</SelectItem>
                              <SelectItem value={'2'}>2 hr</SelectItem>
                              <SelectItem value={'3'}>3 hr</SelectItem>
                              <SelectItem value={'4'}>4 hr</SelectItem>
                              <SelectItem value={'5'}>5 hr</SelectItem>
                              <SelectItem value={'6'}>6 hr</SelectItem>
                              <SelectItem value={'7'}>7 hr</SelectItem>
                              <SelectItem value={'8'}>8 hr</SelectItem>
                              <SelectItem value={'9'}>9 hr</SelectItem>
                              <SelectItem value={'10'}>10 hr</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                      <div className="flex w-full items-center justify-between gap-4">
                        {showMorningPicker && (
                          <TimePicker.RangePicker
                            format={'HH-mm'}
                            disabledTime={disabledTimeMorning}
                            onSelectCapture={field.onChange}
                            onChange={(val) => {
                              console.log({ val: val });

                              setEquipmentSlots((prevSlots) => {
                                const updatedSlots = [...prevSlots];

                                updatedSlots[0] = {
                                  ...updatedSlots[0],
                                  type: 'MORNING',
                                  startTime: val[0]?.format('HH:mm'),
                                  endTime: val[1]?.format('HH:mm'),
                                };
                                return updatedSlots;
                              });
                              setDisableDayEnd(val[1]?.hour() || 23);
                              setDisableMorningEnd(val[1]?.hour() || 23);
                            }}
                            className="btn-style flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        )}
                        {showMorningPicker ? (
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => removeSlot('MORNING')}
                            variant="destructive"
                            className="animate-fade-right animate-duration-200"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleAddSlot('MORNING')}
                            className="w-full animate-fade-left animate-duration-200"
                            variant="outline"
                          >
                            Add Early Morning Slot
                          </Button>
                        )}
                      </div>
                      {showMorningPicker && (
                        <div className="block w-full animate-fade-down pb-6 pt-2 animate-duration-200">
                          <Label>Usage Charge Per Slot</Label>
                          <Input
                            type="number"
                            placeholder="eg: 1"
                            value={morningSlotCost}
                            onChange={(e) => setMorningSlotCost(parseInt(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 rounded border px-2 py-4">
                    {showDayPicker && <Label>Day Slot</Label>}

                    <div className="space-y-2">
                      {showDayPicker && (
                        <Select
                          onValueChange={(val) => {
                            setEquipmentSlots((prevSlots) => {
                              const updatedSlots = [...prevSlots];

                              updatedSlots[1] = {
                                ...updatedSlots[1],
                                duration: val,
                              };
                              return updatedSlots;
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Equipment slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Select Equipment slot</SelectLabel>
                              <SelectItem value={'1'}>1 hr</SelectItem>
                              <SelectItem value={'2'}>2 hr</SelectItem>
                              <SelectItem value={'3'}>3 hr</SelectItem>
                              <SelectItem value={'4'}>4 hr</SelectItem>
                              <SelectItem value={'5'}>5 hr</SelectItem>
                              <SelectItem value={'6'}>6 hr</SelectItem>
                              <SelectItem value={'7'}>7 hr</SelectItem>
                              <SelectItem value={'8'}>8 hr</SelectItem>
                              <SelectItem value={'9'}>9 hr</SelectItem>
                              <SelectItem value={'10'}>10 hr</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                      <div className="flex w-full items-center justify-between gap-4">
                        {showDayPicker && (
                          <TimePicker.RangePicker
                            format={'HH-mm'}
                            disabledTime={disabledTimeDay}
                            onSelectCapture={field.onChange}
                            onChange={(val) => {
                              console.log({ val: val });

                              setEquipmentSlots((prevSlots) => {
                                const updatedSlots = [...prevSlots];

                                updatedSlots[1] = {
                                  ...updatedSlots[1],
                                  type: 'DAY',
                                  startTime: val[0]?.format('HH:mm'),
                                  endTime: val[1]?.format('HH:mm'),
                                };
                                return updatedSlots;
                              });
                              setDisableDayStart(val[0]?.hour() || 23);
                              setDisableDayEnd(val[1]?.hour() || 23);
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
                      {showDayPicker && (
                        <div className="block w-full animate-fade-down pb-6 pt-2 animate-duration-200">
                          <Label>Usage Charge Per Slot</Label>
                          <Input
                            type="number"
                            placeholder="eg: 1"
                            value={daySlotCost}
                            onChange={(e) => setDaySlotCost(parseInt(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 rounded border px-2 py-4">
                    {showEveningPicker && <Label>Evening Slot</Label>}

                    <div className="space-y-2">
                      {showEveningPicker && (
                        <Select
                          onValueChange={(val) => {
                            setEquipmentSlots((prevSlots) => {
                              const updatedSlots = [...prevSlots];

                              updatedSlots[2] = {
                                ...updatedSlots[2],
                                duration: val,
                              };
                              return updatedSlots;
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Equipment slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Select Equipment slot</SelectLabel>
                              <SelectItem value={'1'}>1 hr</SelectItem>
                              <SelectItem value={'2'}>2 hr</SelectItem>
                              <SelectItem value={'3'}>3 hr</SelectItem>
                              <SelectItem value={'4'}>4 hr</SelectItem>
                              <SelectItem value={'5'}>5 hr</SelectItem>
                              <SelectItem value={'6'}>6 hr</SelectItem>
                              <SelectItem value={'7'}>7 hr</SelectItem>
                              <SelectItem value={'8'}>8 hr</SelectItem>
                              <SelectItem value={'9'}>9 hr</SelectItem>
                              <SelectItem value={'10'}>10 hr</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                      <div className=" flex w-full items-center justify-between gap-4">
                        {showEveningPicker && (
                          <TimePicker.RangePicker
                            disabledTime={disabledTimeEvening}
                            format={'HH:mm'}
                            onChange={(val) => {
                              console.log({ val, vale: val[1] });

                              setEquipmentSlots((prevSlots) => {
                                const updatedSlots = [...prevSlots!];
                                updatedSlots[2] = {
                                  ...updatedSlots[2],
                                  type: 'EVENING',
                                  startTime: val[0]?.format('HH:mm'),
                                  endTime: val[1]?.format('HH:mm'),
                                };
                                return updatedSlots;
                              });
                              setDisableEveStart(val[0]?.hour() || 23);
                              setDisableEveEnd(val[1]?.hour() || 23);
                              setDisableNightStart(val[1]?.hour() || 23);
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
                      {showEveningPicker && (
                        <div className="block w-full animate-fade-down pb-6 pt-2 animate-duration-200">
                          <Label>Usage Charge Per Slot</Label>
                          <Input
                            type="number"
                            placeholder="eg: 1"
                            value={eveningSlotCost}
                            onChange={(e) => setEveningSlotCost(parseInt(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 rounded border px-2 py-4">
                    {showNightPicker && <Label>Night Slot</Label>}
                    <div className="space-y-2">
                      {showNightPicker && (
                        <Select
                          onValueChange={(val) => {
                            setEquipmentSlots((prevSlots) => {
                              const updatedSlots = [...prevSlots];

                              updatedSlots[3] = {
                                ...updatedSlots[3],
                                duration: val,
                              };
                              return updatedSlots;
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Equipment slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Select Equipment slot</SelectLabel>
                              <SelectItem value={'1'}>1 hr</SelectItem>
                              <SelectItem value={'2'}>2 hr</SelectItem>
                              <SelectItem value={'3'}>3 hr</SelectItem>
                              <SelectItem value={'4'}>4 hr</SelectItem>
                              <SelectItem value={'5'}>5 hr</SelectItem>
                              <SelectItem value={'6'}>6 hr</SelectItem>
                              <SelectItem value={'7'}>7 hr</SelectItem>
                              <SelectItem value={'8'}>8 hr</SelectItem>
                              <SelectItem value={'9'}>9 hr</SelectItem>
                              <SelectItem value={'10'}>10 hr</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                      <div className="flex w-full items-center justify-between gap-4">
                        {showNightPicker && (
                          <TimePicker.RangePicker
                            disabledTime={disabledTimeNight}
                            format={'HH-mm'}
                            onChange={(val) => {
                              setEquipmentSlots((prevSlots) => {
                                const updatedSlots = [...prevSlots!];
                                updatedSlots[3] = {
                                  ...updatedSlots[3],
                                  type: 'NIGHT',
                                  startTime: val[0]?.format('HH:mm'),
                                  endTime: val[1]?.format('HH:mm'),
                                };
                                return updatedSlots;
                              });
                              setDisableEveEnd(val[0]?.hour() || 24);
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
                    </div>
                  </div>
                  {showNightPicker && (
                    <div className="block w-full animate-fade-down pb-6 pt-2 animate-duration-200">
                      <Label>Usage Charge Per Slot</Label>

                      <Input
                        type="number"
                        placeholder="eg: 1 "
                        value={nightSlotCost}
                        onChange={(e) => setNightSlotCost(parseInt(e.target.value))}
                      />
                    </div>
                  )}
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
