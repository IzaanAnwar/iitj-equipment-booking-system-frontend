'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, SlotInfo, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
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
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/utils/axios-instance';
import { IAccountDetails, IEvent, Slot, User } from '../../../../../types';
import { Loader2 } from 'lucide-react';
import { useGetEquipment } from '@/hooks/use-equipments';
import { Button } from '@/components/ui/button';
import momenttz from 'moment-timezone';
import { Skeleton } from '@/components/ui/skeleton';
type SelectedSlot = {
  year: number;
  month: number;
  date: number;
  start: {
    startHour: number;
    startMinute: number;
  };
  end: {
    endHour: number;
    endMinute: number;
  };
  cost?: number;
};

export function BookEquipment({ equipmentId, user }: { equipmentId: string; user: User | null }) {
  const router = useRouter();
  const [remarks, setRemarks] = useState<string>();
  const [toasted, setToasted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>();
  const [dailogOpen, setdailogOpen] = useState(false);
  const [selectEvent, setSelectedEvent] = useState<IEvent>();
  const equipment = useGetEquipment({ equipmentId });
  const [startTiming, setStartTiming] = useState<{ hour: number; min: number }>();
  const [endTiming, setendTiming] = useState<{ hour: number; min: number }>();
  const useGetAccountDetails = useQuery({
    queryKey: ['account-details'],
    queryFn: async () => {
      const res = await api.get('/users/account');
      console.log({ acc: res });

      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      return (await res.data.account) as IAccountDetails;
    },
  });
  const useGetEvents = useQuery({
    queryKey: ['get-events'],
    queryFn: async () => {
      const res = await api.get(`/bookings/events/${equipmentId}`);
      if (res.status === 200) {
        const allBookings = (await res.data.events) as IEvent[];
        const formattedBookings = allBookings?.map((booking) => ({
          ...booking,
          start: addISTOffset(new Date(booking.start as string)),
          end: addISTOffset(new Date(booking.end as string)),
        }));
        return formattedBookings;
      }
      throw new Error('Something went wrong please try after some time.');
    },
  });
  useEffect(() => {
    if (!equipment.data?.slots) return;
    console.log('STARTING SORt');

    const { start, end } = findStartAndEnd(equipment.data?.slots);
    console.log({ start, end });

    const [startHour, startMinute] = parsteStrTimeToInt(start?.startTime);
    const [endHour, endMinute] = parsteStrTimeToInt(end?.endTime);
    setStartTiming({
      hour: startHour,
      min: startMinute,
    });
    setendTiming({
      hour: endHour,
      min: endMinute,
    });
    console.log({ startHour, endHour, startMinute, endMinute });
  }, [equipment.data?.slots]);

  const useCreateBooking = useMutation({
    mutationKey: ['create-booking'],
    mutationFn: async () => {
      if (!selectedSlot) {
        throw new Error('Slot not selected');
      }
      console.log({ selectedSlot });

      console.log({ selectedSlot });

      const res = await api.post('/bookings/create-booking', {
        equipmentId,
        fromSlot: new Date(
          selectedSlot.year,
          selectedSlot.month,
          selectedSlot.date,
          selectedSlot.start.startHour,
          selectedSlot.start.startMinute,
        ),
        toSlot: new Date(
          selectedSlot.year,
          selectedSlot.month,
          selectedSlot.date,
          selectedSlot.end.endHour,
          selectedSlot.end.endMinute,
        ),
        slotDuration: selectedSlot.end.endHour - selectedSlot.start.startHour,
        userId: user?.userId,
        remark: remarks,
        cost: selectedSlot.cost,
      });
      console.log({ res });
      if (res.status === 201) {
        return await res.data;
      }
      if (res.status === 400) {
        throw new Error('Equipment already booked');
      }
      if (res.status === 200) {
        throw new Error('Equipment is under maintainance');
      }
      throw new Error(await res.data);
      // throw new Error('seome');
    },
  });
  console.log({ selectedSlot });

  const hanldeSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      console.log({ slotInfo });

      const startTime = moment(slotInfo.start);
      const isWeekend = startTime.weekday() === 0 || startTime.weekday() === 6;

      console.log({ startTime, currentDate: currentDate.getDate(), isWeekend: startTime.weekday() });

      const bookingExists = useGetEvents.data?.find((item) => {
        console.log({ h: item.equipment.name });

        const startSlot = item.start;
        const startSlotSel = slotInfo.start;
        const endSlot = item.end;
        const endSlotSel = slotInfo.end;

        if (startSlotSel >= startSlot && startSlotSel < endSlot) {
          return item;
        }
        if (endSlotSel <= endSlot && endSlotSel > startSlot) {
          return item;
        }
      });

      const isTodayOrFuture = moment(startTime).isSameOrAfter(moment(), 'day');
      const now = moment();
      if (bookingExists?.id || !isTodayOrFuture) return;
      if (user?.role === 'user' && isWeekend) {
        toast({
          title: 'Equipment not available for booking',
          description: 'Equipment can not be booked during weekends',
        });
        return;
      }

      console.log({ equipmentinSlo: equipment.data });
      const { start } = findStartAndEnd(equipment.data?.slots!);
      const userSelectedSlot = findRighSlot(slotInfo, equipment.data?.slots!, equipment.data?.slotDuration!);
      if (!userSelectedSlot) {
        toast({
          title: 'Equipment not available for booking',
          description: 'Booking not allowd for selected Slot Time',
        });
        return;
      }
      console.log({ startTimeYAy: userSelectedSlot });
      const fomrattedSelectedSlotData = parseSelectedSlot({
        slotInfo,
        equipmentSlot: userSelectedSlot,
        startMin: parsteStrTimeToInt(userSelectedSlot?.startTime)[1],
        slotDuration: equipment.data?.slotDuration!,
      });
      console.log({ fomrattedSelectedSlotData });
      if (startTime.hour() < now.hour() && startTime.day() <= now.day()) {
        toast({
          title: 'Equipment not available for booking',
          description: 'You are selecting a past date or time',
        });
        return;
      }

      setSelectedSlot({ ...fomrattedSelectedSlotData!, cost: userSelectedSlot.slotCost });
      setdailogOpen(true);
    },
    [currentDate, equipment.data, useGetEvents.data, user?.role],
  );

  const { defaultDate } = useMemo(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const day = new Date().getDate();
    return {
      defaultDate: new Date(year, month, day),
    };
  }, []);

  const eventStyleGetter = (event: IEvent) => {
    console.log({ event });
    setSelectedEvent(event);
    let style = {
      backgroundColor: 'inherit',
    };

    if (!event.id) {
      style.backgroundColor = 'red !important';
    }

    return { style };
  };
  const localizer = momentLocalizer(moment);
  if (useGetEvents.isPending || equipment.isPending || !startTiming) {
    return (
      <div className="flex h-screen w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  console.log({ eventsData: useGetEvents.data });

  const customDayPropGetter = (date: Date) => {
    const today = moment();
    const isTodayOrFuture = moment(date).isSameOrAfter(today, 'day');

    return {
      className: isTodayOrFuture ? 'current-future-date' : 'past-date',
    };
  };
  console.log({ equipment: equipment.data });

  const timeApart = equipment.data?.slotDuration;
  if (!user) {
    router.push('/');
    return;
  }
  if (useCreateBooking.isSuccess && !toasted) {
    toast({
      title: 'Equipment Booked',
      variant: 'success',
    });
    setdailogOpen(false);
    setRemarks('');
    setToasted(true);
    router.push('/dashboard');
  }

  if (useCreateBooking.isError && !toasted) {
    toast({
      title: 'Booking Failed',
      // @ts-ignore
      description: useCreateBooking.error?.response?.data?.message || 'Something went wrong',
      variant: 'destructive',
    });
    setdailogOpen(false);
    setRemarks('');
    setToasted(true);
  }
  if (equipment.isError && !toasted) {
    toast({
      title: 'Something went wrong please try again',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useGetEvents.isError && !toasted) {
    toast({
      title: 'Something went wrong please try again',
      variant: 'destructive',
    });
    setToasted(true);
  }
  console.log({ useCreateBooking, event: useGetEvents.data, startTiming, endTiming });

  return (
    <>
      {useGetAccountDetails.isPending ? (
        <div className=" flex items-center justify-end px-2 md:px-16 lg:px-32">
          <Skeleton className="h-14 w-64" />
        </div>
      ) : (
        <div className=" flex items-center justify-end px-2 md:px-16 lg:px-32">
          <Label className="p-2 text-lg">
            <strong>Credits</strong> ₹ {useGetAccountDetails.data?.token}
          </Label>
        </div>
      )}
      <main className="h-screen w-full px-2 py-8 md:px-16 lg:px-32">
        <Calendar
          localizer={localizer}
          events={useGetEvents.data}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          startAccessor="start"
          endAccessor="end"
          step={60}
          dayPropGetter={customDayPropGetter}
          selectable
          timeslots={timeApart}
          defaultView="week"
          onSelectSlot={hanldeSelectSlot}
          eventPropGetter={eventStyleGetter}
          defaultDate={defaultDate}
          min={
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              startTiming?.hour,
              startTiming?.min,
            )
          }
          max={
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              endTiming?.hour,
              endTiming?.min,
            )
          }
        />
        {selectedSlot && (
          <AlertDialog open={dailogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Please confirm your booking</AlertDialogTitle>
                <AlertDialogDescription>
                  <Card>
                    <CardContent className="space-y-2 p-4">
                      <CardTitle>{equipment.data?.name}</CardTitle>
                      <CardDescription>
                        <strong>Selected Slot</strong>
                        <p>
                          From &nbsp;
                          {`${selectedSlot.date}/${selectedSlot.month}/${selectedSlot.year} ${selectedSlot.start.startHour}:${selectedSlot.start.startMinute}`}
                        </p>
                        <p>
                          To &nbsp;
                          {`${selectedSlot.date}/${selectedSlot.month}/${selectedSlot.year} ${selectedSlot.end.endHour}:${selectedSlot.end.endMinute}`}
                        </p>
                      </CardDescription>
                      <div className="space-y-2 pt-4">
                        <Label>Remarks</Label>
                        <Textarea placeholder="remark" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                      </div>
                    </CardContent>
                  </Card>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setdailogOpen(false);
                    setRemarks('');
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    loading={useCreateBooking.isPending}
                    disabled={useCreateBooking.isPending}
                    onClick={() => {
                      setToasted(false);
                      if (!selectedSlot) {
                        toast({
                          title: 'Slot not Selected',
                          variant: 'destructive',
                        });
                        return;
                      }
                      if (!remarks) {
                        toast({
                          title: 'Please add a remark',
                          variant: 'destructive',
                        });
                        return;
                      }
                      useCreateBooking.mutate();
                    }}
                  >
                    Confirm Booking
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </main>
    </>
  );
}
function parsteStrTimeToInt(time: string | undefined, offset = 0): [number, number] {
  if (!time) return [0, 0];
  const timParts = time.split(':');
  const hour = parseInt(timParts[0], 10) + offset;
  const minute = parseInt(timParts[1], 10);
  console.log({ hour, minute });

  return [hour, minute];
}

function parseSelectedSlot({
  equipmentSlot,
  slotDuration,
  slotInfo,
  startMin,
}: {
  slotInfo: SlotInfo;
  startMin: number;
  equipmentSlot: Slot;
  slotDuration: number;
}): SelectedSlot | null {
  console.log({ slotInfo });
  const interval = correctTiming(slotInfo, equipmentSlot, slotDuration);
  console.log({ interval });

  if (!interval) return null;
  console.log(' Reacdes');

  const year = slotInfo.start.getFullYear();
  const month = slotInfo.start.getMonth();
  const date = slotInfo.start.getDate();
  const startHour = interval.start;

  const endHour = startHour + slotDuration;
  const endMinute = startMin;
  return { year, month, date, start: { startHour, startMinute: startMin }, end: { endHour, endMinute } };
}

function addISTOffset(utcDate: Date) {
  const ISTOffset = 330; // IST offset in minutes (GMT +5:30)
  const ISTTimestamp = utcDate.getTime() + ISTOffset * 60 * 1000;
  return new Date(ISTTimestamp);
}

function findStartAndEnd(slotInfo: Slot[]) {
  const mapping = {
    DAY: 0,
    EVENING: 1,
    NIGHT: 2,
  };
  const sortedArray = slotInfo.sort((a, b) => mapping[a.slotType] - mapping[b.slotType]);

  return { start: sortedArray.at(0), end: sortedArray.at(-1), sortedArray };
}

// function findCostOfBooking(slots: Slot[], selectedSlot: SelectedSlot) {
//   const reqSlot = slots.find((slot) => {
//     const startHour = parseInt(slot.startTime.split(':')[0]);
//     const endHour = parseInt(slot.endTime.split(':')[0]);
//     if (selectedSlot.start.startHour >= startHour && selectedSlot.end.endHour <= endHour) return slot;
//   });
//   console.log({ reqSlot });

//   return reqSlot;
// }

function correctTiming(slotInfo: SlotInfo, equipmentSlot: Slot, slotDuration: number) {
  const startOfBooking = parseInt(equipmentSlot.startTime.split(':')[0]);
  const endOfBooking = parseInt(equipmentSlot.endTime.split(':')[0]);
  const startHour = slotInfo.start.getHours();
  const endHour = slotInfo.end.getHours();
  let intervals: { start: number; end: number }[] = [];
  let m = startOfBooking;
  let n = startOfBooking + slotDuration;
  while (m < endOfBooking) {
    console.log({ arr: intervals, start: m, end: n });

    intervals.push({ start: m, end: n });
    n = n + slotDuration;
    m = m + slotDuration;
  }

  return intervals.find((item) => startHour >= item.start && endHour <= item.end);
}

function findRighSlot(slotInfo: SlotInfo, equipmentSlots: Slot[], slotDuration: number) {
  const selSolt = equipmentSlots.find((slot) => {
    const interval = correctTiming(slotInfo, slot, slotDuration);

    console.log({ intervalssss: interval });

    if (interval) return true;
  });
  console.log({ rightSLot: selSolt });

  return selSolt;
}
