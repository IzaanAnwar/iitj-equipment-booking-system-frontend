'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useGetEquipment } from '@/hooks/use-equipments';
import { api } from '@/utils/axios-instance';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { EquipmentWithMaintenanceLogs } from '../../../../../../types';
import { toast } from '@/components/ui/use-toast';
import { Modal, TimePicker } from 'antd';
import { Dayjs } from 'dayjs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Editor } from './editor';
export default function EditEquipment({ params }: { params: { equipmentId: string } }) {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [place, setPlace] = useState<string>('');
  const [disableMorningEnd, setDisableMorningEnd] = useState<number>(0);
  const [disableDayStart, setDisableDayStart] = useState<number>(24);
  const [disableDayEnd, setDisableDayEnd] = useState<number>(0);
  const [disableEveStart, setDisableEveStart] = useState<number>(24);
  const [disableEveEnd, setDisableEveEnd] = useState<number>(24);
  const [disableNightStart, setDisableNightStart] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [slotTypeSel, setSlotTypeSel] = useState('');
  const [updateSlotPrice, setUpdateSlotPrice] = useState<string>();
  const [openSlotModal, setOpenSlotModal] = useState<'mod' | 'del' | 'cost'>('mod');
  const [equipmentSlots, setEquipmentSlots] = useState<
    {
      type: string;
      startTime: string | undefined | null;
      endTime: string | undefined | null;
      duration: string;
    }[]
  >([]);
  const [morningSlotCost, setMorningSlotCost] = useState<number>();
  const [daySlotCost, setDaySlotCost] = useState<number>();
  const [eveningSlotCost, setEveningSlotCost] = useState<number>();
  const [nightSlotCost, setNightSlotCost] = useState<number>();
  const [description, setDescription] = useState<string>('');
  const [toasted, setToasted] = useState<boolean>(false);

  const [dayMaxBookings, setDayMaxBookings] = useState<number>();
  const [morningMaxBookings, setMorningMaxBookings] = useState<number>();
  const [eveningMaxBookings, setEveningMaxBookings] = useState<number>();
  const [nightMaxBookings, setNightMaxBookings] = useState<number>();

  const equipment = useQuery({
    queryKey: ['get-equipment'],
    queryFn: async () => {
      const res = await api.get(`equipments?id=${params.equipmentId}`);
      console.log({ resbe: res });

      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      const data = res.data?.equipment as EquipmentWithMaintenanceLogs;
      setName(data.name);
      setPlace(data.place);
      setDescription(data.description);

      return data;
    },
  });

  function onSubmit() {
    if (openSlotModal === 'mod') {
      updateEquipmetnDetails.mutate();
    }
    if (openSlotModal === 'cost') {
      if (!slotTypeSel || !updateSlotPrice) {
        toast({
          title: 'No Value entered',
          variant: 'destructive',
        });
        return;
      }
      console.log({ equipmentSlots });

      updateCost.mutate({ slotId: slotTypeSel, cost: updateSlotPrice });
    }
  }

  const deleteSlot = useMutation({
    mutationKey: ['dlete-slot'],
    mutationFn: async (slotId: string) => {
      const res = await api.post('/equipments/delete', {
        slotId,
      });

      if (res.status !== 200) {
        throw new Error(res.data);
      }

      return res.data;
    },
    onSuccess: () => {
      router.refresh();
      equipment.refetch();
    },
  });
  const updateCost = useMutation({
    mutationKey: ['update-slot-cost', slotTypeSel],
    mutationFn: async ({ cost, slotId }: { slotId: string; cost: string | undefined }) => {
      const res = await api.post('/equipments/update-cost', {
        slotId,
        cost: cost && parseInt(cost),
      });

      if (res.status !== 200) {
        throw new Error(res.data);
      }

      return res.data;
    },
    onSuccess: () => {
      router.refresh();
      equipment.refetch();
    },
  });
  const updateEquipmetnDetails = useMutation({
    mutationKey: ['update-equipment-details', params.equipmentId],
    mutationFn: async () => {
      try {
        console.log('Starting update');

        const equimentSlotCategories: {
          type: string;
          cost: number;
          startTime: string;
          endTime: string;
          duration: number;
          maxBookings: number;
        }[] = [];
        for (const category of equipmentSlots) {
          let cost: number | undefined = 0;
          let maxBookings = 1;
          if (category?.type === 'MORNING') {
            cost = morningSlotCost;
            maxBookings = morningMaxBookings || 1;
          } else if (category?.type === 'DAY') {
            cost = daySlotCost;
            maxBookings = dayMaxBookings || 1;
          } else if (category?.type === 'EVENING') {
            cost = eveningSlotCost;
            maxBookings = eveningMaxBookings || 1;
          } else if (category?.type === 'NIGHT') {
            cost = nightSlotCost;
            maxBookings = nightMaxBookings || 1;
          }
          if (category && category?.type) {
            equimentSlotCategories.push({
              type: category.type,
              cost: cost || 0,
              duration: parseInt(category.duration),
              startTime: category.startTime!,
              endTime: category.endTime!,
              maxBookings,
            });
          }
        }
        const res = await api.post('/equipments/update', {
          id: params.equipmentId,
          name,
          place,
          description,
          equipmentSlots: equimentSlotCategories,
        });
        console.log({ res });

        if (res.status !== 200) {
          throw new Error(res.data);
        }
        console.log('here');

        return res.data;
      } catch (error: any) {
        console.error({ error });
        throw new Error(error);
      }
    },
    onSuccess: () => {
      router.refresh();
      equipment.refetch();
    },
  });

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

  if (equipment.isPending) {
    return (
      <div className="h-screen w-full space-y-4 px-2 py-12 md:px-10 lg:px-20">
        <Skeleton className="h-96 w-full" />
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-12 w-44" />
          <Skeleton className="h-12 w-44" />
        </div>
      </div>
    );
  }
  if (updateEquipmetnDetails.isSuccess && !toasted) {
    toast({ title: 'Updated', variant: 'success' });
    setToasted(true);
  }
  if (deleteSlot.isSuccess && !toasted) {
    toast({ title: 'Updated', variant: 'success' });
    setToasted(true);
  }
  if (updateEquipmetnDetails.isError && !toasted) {
    toast({
      title: 'Error',
      // @ts-ignore
      description: updateEquipmetnDetails.error?.response?.data?.message || 'Could not update',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (deleteSlot.isError && !toasted) {
    toast({
      title: 'Error',
      // @ts-ignore
      description: deleteSlot.error?.response?.data?.message || 'Could not Delete',
      variant: 'destructive',
    });
    setToasted(true);
  }

  return (
    <main className="px-2 py-12 md:px-10 lg:px-20">
      <AlertDialog open={open} onOpenChange={(state) => setOpen(state)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to update these changes?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-[0.925rem] text-zinc-950">
              <div>
                <p>
                  Name <strong>{name}</strong>
                </p>
                <p>
                  Place <strong>{place}</strong>
                </p>
                <p
                  className="ql-editor max-h-[50vh] overflow-y-scroll"
                  dangerouslySetInnerHTML={{ __html: description }}
                ></p>
              </div>

              <div>
                {updateSlotPrice && (
                  <p>
                    <strong>Updated Price</strong> {updateSlotPrice}
                  </p>
                )}
                {equipmentSlots.at(0) && (
                  <p>
                    <strong>{equipmentSlots.at(0)?.type}</strong> {equipmentSlots.at(0)?.startTime} -{' '}
                    {equipmentSlots.at(0)?.endTime} at {daySlotCost} credit and <strong>Slot Duration</strong>{' '}
                    {equipmentSlots.at(0)?.duration} h
                  </p>
                )}
                {equipmentSlots.at(1) && (
                  <p>
                    <strong>{equipmentSlots.at(1)?.type}</strong> {equipmentSlots.at(1)?.startTime} -{' '}
                    {equipmentSlots.at(1)?.endTime} at {eveningSlotCost} credit and <strong>Slot Duration</strong>{' '}
                    {equipmentSlots.at(1)?.duration} h
                  </p>
                )}
                {equipmentSlots.at(2) && (
                  <p>
                    <strong>{equipmentSlots.at(2)?.type}</strong> {equipmentSlots.at(2)?.startTime} -{' '}
                    {equipmentSlots.at(2)?.endTime} at {nightSlotCost} credit and <strong>Slot Duration</strong>{' '}
                    {equipmentSlots.at(2)?.duration} h
                  </p>
                )}
                {equipmentSlots.at(3) && (
                  <p>
                    <strong>{equipmentSlots.at(3)?.type}</strong> {equipmentSlots.at(3)?.startTime} -{' '}
                    {equipmentSlots.at(3)?.endTime} at {nightSlotCost} credit and <strong>Slot Duration</strong>{' '}
                    {equipmentSlots.at(3)?.duration} h
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onSubmit}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Update &ldquo;{equipment.data?.name}&rdquo; details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full items-center justify-between space-y-4 md:flex md:space-x-4 md:space-y-0">
            <div className="w-full space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="w-full space-y-2">
              <Label>Place</Label>
              <Input value={place} onChange={(e) => setPlace(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Editor state={description} setState={setDescription} />
          </div>

          <div className="space-y-2 rounded border px-3 py-2">
            <Label className="text-lg font-bold">Slot Information</Label>
            {equipment.data?.slots &&
              equipment.data.slots
                .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime))
                .map((data) => {
                  return (
                    <div key={data.id} className="space-y-2 rounded bg-zinc-100 p-1">
                      <h3 className="text-lg font-bold">
                        {data.slotType === 'MORNING' ? 'EARLY MORNING' : data.slotType}
                      </h3>
                      <div>
                        <p>
                          <strong>Timing</strong> {data?.startTime.slice(0, 5)} - {data?.endTime.slice(0, 5)}
                        </p>
                        <p>
                          <strong>Credit</strong>: {data?.slotCost}
                        </p>
                        <p>
                          <strong>Slot Duration</strong>: {data?.slotDuration} H
                        </p>
                        <p>
                          <strong>Max Allowed Booking</strong> {data.maxBookings}
                        </p>
                      </div>
                    </div>
                  );
                })}
          </div>
          <div className="flex items-center justify-start gap-4">
            <Button
              variant={openSlotModal === 'mod' ? 'default' : 'outline'}
              size={'sm'}
              onClick={() => setOpenSlotModal('mod')}
            >
              Modify Slots
            </Button>
            <Button
              size="sm"
              variant={openSlotModal === 'del' ? 'default' : 'outline'}
              onClick={() => setOpenSlotModal('del')}
            >
              Delete Slots
            </Button>
            <Button
              size="sm"
              variant={openSlotModal === 'cost' ? 'default' : 'outline'}
              onClick={() => setOpenSlotModal('cost')}
            >
              Update Usage Charges
            </Button>
          </div>
          {openSlotModal === 'del' && (
            <>
              {deleteSlot.isPending ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <div className="flex w-fit flex-col gap-2">
                  {equipment.data?.slots
                    .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime))
                    .map((sl) => (
                      <Button
                        key={sl.id}
                        variant={'destructive'}
                        size={'sm'}
                        onClick={() => {
                          deleteSlot.mutate(sl.id);
                        }}
                      >
                        Delete {sl.slotType.toLowerCase() === 'morning' ? 'early morning' : sl.slotType.toLowerCase()}{' '}
                        slot
                      </Button>
                    ))}
                </div>
              )}
            </>
          )}
          {openSlotModal === 'cost' && (
            <div className="space-y-3 md:max-w-[50%]">
              <Select onValueChange={(value) => setSlotTypeSel(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Equipment slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Slot Type</SelectLabel>
                    {equipment.data?.slots?.map((n) => {
                      return (
                        <SelectItem key={n.id} value={n.id}>
                          {n.slotType === 'MORNING' ? 'EARLY MORNING' : n.slotType}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                placeholder="Slot cost"
                type="number"
                value={updateSlotPrice}
                onChange={(e) => setUpdateSlotPrice(e.target.value)}
              />
            </div>
          )}
          {openSlotModal === 'mod' && (
            <div className="max-w-[60%]  animate-fade-down space-y-3">
              <Label>Note: Atleast details of one slot should be modified</Label>
              <div className="space-y-2 rounded border px-2 py-3 duration-200 hover:bg-zinc-100">
                <Label className="text-lg font-semibold">Early Morning Slot</Label>
                <div className="space-y-2">
                  <Label>Slot Duration</Label>
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
                </div>
                <TimePicker.RangePicker
                  format={'HH-mm'}
                  disabledTime={disabledTimeMorning}
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
                <div className="block w-full animate-fade-down space-y-3 pb-6 pt-2 animate-duration-200">
                  <Label>Usage Charge Per Slot</Label>

                  <Input
                    type="number"
                    placeholder="eg: 1 "
                    value={morningSlotCost}
                    onChange={(e) => setMorningSlotCost(parseInt(e.target.value))}
                  />

                  <Label>Max Bookings</Label>
                  <Input
                    type="number"
                    placeholder="eg: 1"
                    value={morningMaxBookings}
                    onChange={(e) => {
                      console.log({ e: e.target.value });

                      setMorningMaxBookings(parseInt(e.target.value));
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2 rounded border px-2 py-3 duration-200 hover:bg-zinc-100">
                <Label className="text-lg font-semibold">Day Slot</Label>
                <div className="space-y-2">
                  <Label>Slot Duration</Label>
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
                </div>
                <TimePicker.RangePicker
                  format={'HH-mm'}
                  disabledTime={disabledTimeDay}
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
                <div className="block w-full animate-fade-down space-y-3 pb-6 pt-2 animate-duration-200">
                  <Label>Usage Charge Per Slot</Label>

                  <Input
                    type="number"
                    placeholder="eg: 1 "
                    value={daySlotCost}
                    onChange={(e) => setDaySlotCost(parseInt(e.target.value))}
                  />
                  <Label>Max Bookings</Label>
                  <Input
                    type="number"
                    placeholder="eg: 1"
                    value={dayMaxBookings}
                    onChange={(e) => setDayMaxBookings(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2 rounded border px-2 py-3 duration-200 hover:bg-zinc-100">
                <Label className="text-lg font-semibold">Evening Slot</Label>
                <div className="space-y-2">
                  <Label>Slot Duration</Label>
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
                </div>
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
                <div className="block w-full animate-fade-down space-y-3 pb-6 pt-2 animate-duration-200">
                  <Label>Usage Charge Per Slot</Label>

                  <Input
                    type="number"
                    placeholder="eg: 1 "
                    value={eveningSlotCost}
                    onChange={(e) => setEveningSlotCost(parseInt(e.target.value))}
                  />

                  <Label>Max Bookings</Label>
                  <Input
                    type="number"
                    placeholder="eg: 1"
                    value={eveningMaxBookings}
                    onChange={(e) => setEveningMaxBookings(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2 rounded border px-2 py-3 duration-200 hover:bg-zinc-100">
                <Label className="text-lg font-semibold">Night Slot</Label>
                <div className="space-y-2">
                  <Label>Slot Duration</Label>
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
                </div>
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
                <div className="block w-full animate-fade-down space-y-3 pb-6 pt-2 animate-duration-200">
                  <Label>Usage Charge Per Slot</Label>

                  <Input
                    type="number"
                    placeholder="eg: 1 "
                    value={nightSlotCost}
                    onChange={(e) => setNightSlotCost(parseInt(e.target.value))}
                  />
                  <Label>Max Bookings</Label>
                  <Input
                    type="number"
                    placeholder="eg: 1"
                    value={nightMaxBookings}
                    onChange={(e) => setNightMaxBookings(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-start gap-4">
          <Button
            onClick={() => {
              setToasted(false);
              if (!name && !place && !description && equipmentSlots.length === 0) {
                toast({
                  title: 'No data provided to update',
                  variant: 'destructive',
                });
                return;
              }
              setOpen(true);
            }}
            loading={updateEquipmetnDetails.isPending || updateCost.isPending}
            disabled={updateEquipmetnDetails.isPending || updateCost.isPending}
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
