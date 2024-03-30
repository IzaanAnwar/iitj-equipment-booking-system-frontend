'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, SlotInfo, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useCallback, useMemo, useState } from 'react';
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
import { IEvent, Slot, User } from '../../../../../types';
import { Loader2 } from 'lucide-react';
import { useGetEquipment } from '@/hooks/use-equipments';
import { Button } from '@/components/ui/button';
import momenttz from 'moment-timezone';
import { time } from 'console';
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

  const useCreateBooking = useMutation({
    mutationKey: ['create-booking'],
    mutationFn: async () => {
      if (!selectedSlot) {
        throw new Error('Slot not selected');
      }

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
      });
      console.log({ res });
      if (res.status === 201) {
        return await res.data;
      }
      if (res.status === 200) {
        throw new Error('Equipment already booked');
      }
      throw new Error(await res.data);
    },
  });
  const hanldeSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      console.log({ slotInfo });

      const start = moment(slotInfo.start);
      const isWeekend = start.weekday() === 0 || start.weekday() === 6;

      console.log({ start, currentDate: currentDate.getDate(), isWeekend: start.weekday() });

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
      const isTodayOrFuture = moment(start).isSameOrAfter(moment(), 'day');

      if (bookingExists?.id || !isTodayOrFuture) return;
      if (user?.role === 'user' && isWeekend) {
        toast({
          title: 'Equipment not available for booking',
          description: 'Equipment can not be booked during weekends',
        });
        return;
      }
      setSelectedSlot(parseSelectedSlot(slotInfo, equipment.data?.slots.at(0)!, equipment.data?.slotDuration!));
      setdailogOpen(true);
    },
    [currentDate, equipment.data?.slotDuration, equipment.data?.slots, useGetEvents.data, user?.role],
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
  if (useGetEvents.isPending || equipment.isPending) {
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
  console.log({ equipment: equipment.data?.slots?.at(0)?.startTime, data: equipment.data });

  const [startHour, startMinute] = parsteStrTimeToInt(equipment.data?.slots?.at(0)?.startTime);
  const [endHour, endMinute] = parsteStrTimeToInt(equipment.data?.slots?.at(-1)?.endTime);
  console.log({ startHour, endHour, startMinute, endMinute });
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
  console.log({ useCreateBooking, event: useGetEvents.data, hh: typeof useGetEvents.data?.at(0)?.start });

  return (
    <>
      <div className=" flex items-center justify-end px-2 md:px-16 lg:px-32">
        <Label className="p-2 text-lg">
          <strong>Credits</strong> ₹ 10000
        </Label>
      </div>
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
            new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), startHour, startMinute)
          }
          max={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), endHour, endMinute)}
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

function parseSelectedSlot(slotInfo: SlotInfo, equipmentSlot: Slot, slotDuration: number): SelectedSlot {
  console.log({ slotInfo });

  const year = slotInfo.start.getFullYear();
  const month = slotInfo.start.getMonth();
  const date = slotInfo.start.getDate();
  const startHour = slotInfo.start.getHours();
  const [_, startMinute] = parsteStrTimeToInt(equipmentSlot.startTime);
  const endHour = startHour + slotDuration;
  const endMinute = startMinute;
  return { year, month, date, start: { startHour, startMinute }, end: { endHour, endMinute } };
}

function addISTOffset(utcDate: Date) {
  const ISTOffset = 330; // IST offset in minutes (GMT +5:30)
  const ISTTimestamp = utcDate.getTime() + ISTOffset * 60 * 1000;
  return new Date(ISTTimestamp);
}
