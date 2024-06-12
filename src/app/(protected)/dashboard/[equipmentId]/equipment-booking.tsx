'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, DateRange, Formats, SlotInfo, momentLocalizer } from 'react-big-calendar';
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
  const [selectedToggle, setToggle] = useState<'morning' | 'day' | 'eve' | 'night'>('day');
  const [dailogOpen, setdailogOpen] = useState(false);
  const [morningSlot, setMorningSlot] = useState<Slot>();
  const [daySlot, setDaySlot] = useState<Slot>();
  const [eveningSlot, setEveningSlot] = useState<Slot>();
  const [nighslot, setNightSlot] = useState<Slot>();
  const [selectEvent, setSelectedEvent] = useState<IEvent>();
  const equipment = useGetEquipment({ equipmentId });
  const [startTiming, setStartTiming] = useState<{ hour: number; min: number }>();
  const [endTiming, setendTiming] = useState<{ hour: number; min: number }>();
  const [periods, setPeriods] = useState<{
    morning?: { start: { hour: number; min: number }; end: { hour: number; min: number } };
    day?: { start: { hour: number; min: number }; end: { hour: number; min: number } };
    evening?: { start: { hour: number; min: number }; end: { hour: number; min: number } };
    night?: { start: { hour: number; min: number }; end: { hour: number; min: number } };
  }>();

  const [dayEvents, setDayEvents] = useState<IEvent[]>();
  const [morningEvents, setMorningEvents] = useState<IEvent[]>();
  const [eveningEvents, setEveningEvents] = useState<IEvent[]>();
  const [nightEvents, setNightEvents] = useState<IEvent[]>();

  const localizer = momentLocalizer(moment);

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

    const { start, end } = findStartAndEnd(equipment.data?.slots);
    const slot0 = equipment.data.slots.find((sl) => sl.slotType === 'MORNING');
    const slot1 = equipment.data.slots.find((sl) => sl.slotType === 'DAY');
    const slot2 = equipment.data.slots.find((sl) => sl.slotType === 'EVENING');
    const slot3 = equipment.data.slots.find((sl) => sl.slotType === 'NIGHT');
    console.log({ slot0 });

    setMorningSlot(slot0);
    setDaySlot(slot1);
    setEveningSlot(slot2);
    setNightSlot(slot3);
    const morningSlotStart = slot0 && parsteStrTimeToInt(slot0?.startTime);
    const endmorningSlot = slot0 && parsteStrTimeToInt(slot0?.endTime);
    console.log({ morningSlotStart, endmorningSlot });

    const daySlotStart = slot1 && parsteStrTimeToInt(slot1?.startTime);
    const enddaySlot = slot1 && parsteStrTimeToInt(slot1?.endTime);
    const eveSlotStart = slot2 && parsteStrTimeToInt(slot2?.startTime);
    const endeveSlot = slot2 && parsteStrTimeToInt(slot2?.endTime);
    const nightSlotStart = slot3 && parsteStrTimeToInt(slot3?.startTime);
    const endnightSlot = slot3 && parsteStrTimeToInt(slot3?.endTime);
    setPeriods({
      ...(morningSlotStart &&
        endmorningSlot && {
          morning: {
            start: { hour: morningSlotStart?.[0], min: morningSlotStart?.[1] },
            end: { hour: endmorningSlot?.[0], min: endmorningSlot?.[1] },
          },
        }),
      ...(daySlotStart &&
        enddaySlot && {
          day: {
            start: { hour: daySlotStart?.[0], min: daySlotStart?.[1] },
            end: { hour: enddaySlot?.[0], min: enddaySlot?.[1] },
          },
        }),
      ...(eveSlotStart &&
        endeveSlot && {
          evening: {
            start: { hour: eveSlotStart?.[0], min: eveSlotStart?.[1] },
            end: { hour: endeveSlot?.[0], min: endeveSlot?.[1] },
          },
        }),
      ...(nightSlotStart &&
        endnightSlot && {
          night: {
            start: { hour: nightSlotStart?.[0], min: nightSlotStart?.[1] },
            end: { hour: endnightSlot?.[0], min: endnightSlot?.[1] },
          },
        }),
    });

    const morEvent = useGetEvents.data?.filter((event) => {
      const slotStart = new Date(event.slotTimeStart).getHours();
      const slotEnd = new Date(event.slotTimeEnd).getHours();

      if (morningSlotStart && endmorningSlot && slotStart >= morningSlotStart?.[0] && slotEnd <= endmorningSlot?.[0]) {
        return event;
      }
    });
    const dEvent = useGetEvents.data?.filter((event) => {
      const slotStart = new Date(event.slotTimeStart).getHours();
      const slotEnd = new Date(event.slotTimeEnd).getHours();
      console.log({ slotStart, slotEnd, day: daySlotStart, enddaySlot });

      if (daySlotStart && enddaySlot && slotStart >= daySlotStart?.[0] && slotEnd <= enddaySlot?.[0]) {
        return event;
      }
    });
    const eveEvent = useGetEvents.data?.filter((event) => {
      const slotStart = new Date(event.slotTimeStart).getHours();
      const slotEnd = new Date(event.slotTimeEnd).getHours();

      if (eveSlotStart && endeveSlot && slotStart >= eveSlotStart?.[0] && slotEnd <= endeveSlot?.[0]) {
        return event;
      }
    });
    const nightEvent = useGetEvents.data?.filter((event) => {
      const slotStart = new Date(event.slotTimeStart).getHours();
      const slotEnd = new Date(event.slotTimeEnd).getHours();

      if (nightSlotStart && endnightSlot && slotStart >= nightSlotStart?.[0] && slotEnd <= endnightSlot?.[0]) {
        return event;
      }
    });

    setMorningEvents(morEvent);
    setDayEvents(dEvent);
    setEveningEvents(eveEvent);
    setNightEvents(nightEvent);

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
  }, [equipment.data?.slots, useGetEvents.data]);

  const useCreateBooking = useMutation({
    mutationKey: ['create-booking'],
    mutationFn: async () => {
      if (!selectedSlot) {
        throw new Error('Slot not selected');
      }

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
    onSuccess: () => router.refresh(),
  });
  const formats: Formats = useMemo(
    () => ({
      timeGutterFormat: 'HH:mm',
      eventTimeRangeFormat: ({ start, end }) => {
        return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
      },
    }),
    [],
  );

  const hanldeSelectMorningSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const startTime = moment(slotInfo.start);

      const isWeekend = startTime.weekday() === 0 || startTime.weekday() === 6;

      const bookingExists = useGetEvents.data?.find((item) => {
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
      const isTodayOrPast = moment(startTime).isSameOrBefore(moment(), 'day');
      if (isTodayOrPast) {
        if (startTime.hour() < now.hour() && startTime.day() <= now.day()) {
          toast({
            title: 'Equipment not available for booking',
            description: 'You are selecting a past date or time',
          });
          return;
        }
      }
      if (bookingExists?.id || !isTodayOrFuture) return;
      if (user?.role === 'user' && isWeekend) {
        toast({
          title: 'Equipment not available for booking',
          description: 'Equipment can not be booked during weekends',
        });
        return;
      }

      const fomrattedSelectedSlotData = parseSelectedSlot({
        slotInfo,
        equipmentSlot: morningSlot!,
        startMin: parsteStrTimeToInt(morningSlot?.startTime)[1],
        slotDuration: morningSlot?.slotDuration!,
      });
      if (!fomrattedSelectedSlotData) {
        toast({
          title: 'Wrong Timing',
          description: 'Equipment can not be booked for selected Time Slot',
        });
        return;
      }
      setSelectedSlot({ ...fomrattedSelectedSlotData!, cost: morningSlot?.slotCost });
      setdailogOpen(true);
    },
    [equipment.data, useGetEvents.data, user?.role, morningSlot],
  );
  ///

  const hanldeSelectDaySlot = useCallback(
    (slotInfo: SlotInfo) => {
      const startTime = moment(slotInfo.start);

      const isWeekend = startTime.weekday() === 0 || startTime.weekday() === 6;

      const bookingExists = useGetEvents.data?.find((item) => {
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
      const isTodayOrPast = moment(startTime).isSameOrBefore(moment(), 'day');
      if (isTodayOrPast) {
        if (startTime.hour() < now.hour() && startTime.day() <= now.day()) {
          toast({
            title: 'Equipment not available for booking',
            description: 'You are selecting a past date or time',
          });
          return;
        }
      }
      if (bookingExists?.id || !isTodayOrFuture) return;
      if (user?.role === 'user' && isWeekend) {
        toast({
          title: 'Equipment not available for booking',
          description: 'Equipment can not be booked during weekends',
        });
        return;
      }

      const fomrattedSelectedSlotData = parseSelectedSlot({
        slotInfo,
        equipmentSlot: daySlot!,
        startMin: parsteStrTimeToInt(daySlot?.startTime)[1],
        slotDuration: daySlot?.slotDuration!,
      });
      if (!fomrattedSelectedSlotData) {
        toast({
          title: 'Wrong Timing',
          description: 'Equipment can not be booked for selected Time Slot',
        });
        return;
      }
      setSelectedSlot({ ...fomrattedSelectedSlotData!, cost: daySlot?.slotCost });
      setdailogOpen(true);
    },
    [equipment.data, useGetEvents.data, user?.role, daySlot],
  );
  //

  const hanldeSelectEveningSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const startTime = moment(slotInfo.start);

      const isWeekend = startTime.weekday() === 0 || startTime.weekday() === 6;

      const bookingExists = useGetEvents.data?.find((item) => {
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
      const isTodayOrPast = moment(startTime).isSameOrBefore(moment(), 'day');
      if (isTodayOrPast) {
        if (startTime.hour() < now.hour() && startTime.day() <= now.day()) {
          toast({
            title: 'Equipment not available for booking',
            description: 'You are selecting a past date or time',
          });
          return;
        }
      }
      if (bookingExists?.id || !isTodayOrFuture) return;
      if (user?.role === 'user' && isWeekend) {
        toast({
          title: 'Equipment not available for booking',
          description: 'Equipment can not be booked during weekends',
        });
        return;
      }

      const fomrattedSelectedSlotData = parseSelectedSlot({
        slotInfo,
        equipmentSlot: eveningSlot!,
        startMin: parsteStrTimeToInt(eveningSlot?.startTime)[1],
        slotDuration: eveningSlot?.slotDuration!,
      });
      if (!fomrattedSelectedSlotData) {
        toast({
          title: 'Wrong Timing',
          description: 'Equipment can not be booked for selected Time Slot',
        });
        return;
      }

      setSelectedSlot({ ...fomrattedSelectedSlotData!, cost: eveningSlot?.slotCost });
      setdailogOpen(true);
    },
    [equipment.data, useGetEvents.data, user?.role, eveningSlot],
  );
  //

  const hanldeSelectNightSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const startTime = moment(slotInfo.start);

      const isWeekend = startTime.weekday() === 0 || startTime.weekday() === 6;

      const bookingExists = useGetEvents.data?.find((item) => {
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
      const isTodayOrPast = moment(startTime).isSameOrBefore(moment(), 'day');
      if (isTodayOrPast) {
        if (startTime.hour() < now.hour() && startTime.day() <= now.day()) {
          toast({
            title: 'Equipment not available for booking',
            description: 'You are selecting a past date or time',
          });
          return;
        }
      }
      if (bookingExists?.id || !isTodayOrFuture) return;
      if (user?.role === 'user' && isWeekend) {
        toast({
          title: 'Equipment not available for booking',
          description: 'Equipment can not be booked during weekends',
        });
        return;
      }

      const fomrattedSelectedSlotData = parseSelectedSlot({
        slotInfo,
        equipmentSlot: nighslot!,
        startMin: parsteStrTimeToInt(nighslot?.startTime)[1],
        slotDuration: nighslot?.slotDuration!,
      });
      if (!fomrattedSelectedSlotData) {
        toast({
          title: 'Wrong Timing',
          description: 'Equipment can not be booked for selected Time Slot',
        });
        return;
      }
      setSelectedSlot({ ...fomrattedSelectedSlotData!, cost: nighslot?.slotCost });
      setdailogOpen(true);
    },
    [equipment.data, useGetEvents.data, user?.role, nighslot],
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
    setSelectedEvent(event);
    let style = {
      backgroundColor: 'inherit',
    };

    if (!event.id) {
      style.backgroundColor = 'red !important';
    }

    return { style };
  };
  if (useGetEvents.isPending || equipment.isPending || !startTiming) {
    return (
      <div className="flex h-screen w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  console.log({ morningSlot, daySlot, eveningSlot, nighslot });

  const customDayPropGetter = (date: Date) => {
    const today = moment();
    const isTodayOrFuture = moment(date).isSameOrAfter(today, 'day');

    return {
      className: isTodayOrFuture ? 'current-future-date' : 'past-date',
    };
  };

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

  console.log({ morningEvents, dayEvents });

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
      <main className="min-h-screen w-full space-y-6 px-2 py-8 md:px-16 lg:px-32">
        <div className="space-y-1">
          <h5>Select Slot Type</h5>
          <div className="flex items-center justify-start gap-4">
            {morningSlot && (
              <Button
                variant={selectedToggle === 'morning' ? 'default' : 'secondary'}
                size={'sm'}
                onClick={() => setToggle('morning')}
              >
                Early Morning
              </Button>
            )}
            {daySlot && (
              <Button
                variant={selectedToggle === 'day' ? 'default' : 'secondary'}
                size={'sm'}
                onClick={() => setToggle('day')}
              >
                Day
              </Button>
            )}
            {eveningSlot && (
              <Button
                variant={selectedToggle === 'eve' ? 'default' : 'secondary'}
                size={'sm'}
                onClick={() => setToggle('eve')}
              >
                Evening
              </Button>
            )}
            {nighslot && (
              <Button
                variant={selectedToggle === 'night' ? 'default' : 'secondary'}
                size={'sm'}
                onClick={() => setToggle('night')}
              >
                Night
              </Button>
            )}
          </div>
        </div>
        <div className="w-full">
          {morningSlot && selectedToggle === 'morning' && (
            <Calendar
              localizer={localizer}
              events={morningEvents}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              startAccessor="start"
              endAccessor="end"
              step={60}
              dayPropGetter={customDayPropGetter}
              selectable
              timeslots={morningSlot.slotDuration}
              defaultView="week"
              onSelectSlot={hanldeSelectMorningSlot}
              eventPropGetter={eventStyleGetter}
              formats={formats}
              defaultDate={defaultDate}
              min={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  periods?.morning?.start.hour,
                  periods?.morning?.start.min,
                )
              }
              max={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),

                  periods?.morning?.end?.hour,
                  periods?.morning?.end?.min,
                )
              }
            />
          )}
          {daySlot && selectedToggle === 'day' && (
            <Calendar
              localizer={localizer}
              events={dayEvents}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              startAccessor="start"
              endAccessor="end"
              step={60}
              dayPropGetter={customDayPropGetter}
              selectable
              timeslots={daySlot.slotDuration}
              defaultView="week"
              onSelectSlot={hanldeSelectDaySlot}
              eventPropGetter={eventStyleGetter}
              formats={formats}
              defaultDate={defaultDate}
              min={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  periods?.day?.start.hour,
                  periods?.day?.start.min,
                )
              }
              max={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  periods?.day?.end?.hour,
                  periods?.day?.end?.min,
                )
              }
            />
          )}
          {eveningSlot && selectedToggle === 'eve' && (
            <Calendar
              localizer={localizer}
              events={eveningEvents}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              startAccessor="start"
              endAccessor="end"
              step={60}
              dayPropGetter={customDayPropGetter}
              selectable
              timeslots={eveningSlot?.slotDuration}
              defaultView="week"
              onSelectSlot={hanldeSelectEveningSlot}
              eventPropGetter={eventStyleGetter}
              formats={formats}
              defaultDate={defaultDate}
              min={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  periods?.evening?.start.hour,
                  periods?.evening?.start.min,
                )
              }
              max={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  periods?.evening?.end?.hour,
                  periods?.evening?.end?.min,
                )
              }
            />
          )}
          {nighslot && selectedToggle === 'night' && (
            <Calendar
              localizer={localizer}
              events={nightEvents}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              startAccessor="start"
              endAccessor="end"
              step={60}
              dayPropGetter={customDayPropGetter}
              selectable
              timeslots={nighslot.slotDuration}
              defaultView="week"
              onSelectSlot={hanldeSelectNightSlot}
              eventPropGetter={eventStyleGetter}
              formats={formats}
              defaultDate={defaultDate}
              min={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  periods?.night?.start.hour,
                  periods?.night?.start.min,
                )
              }
              max={
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                  periods?.night?.end?.hour,
                  periods?.night?.end?.min,
                )
              }
            />
          )}
        </div>
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
                        <Label>Remarks / Booking For</Label>
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
  const interval = correctTiming(slotInfo, equipmentSlot, slotDuration);
  console.log({ interval });

  if (!interval) return null;

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
    MORNING: 0,
    DAY: 1,
    EVENING: 2,
    NIGHT: 3,
  };
  const sortedArray = slotInfo.sort((a, b) => mapping[a.slotType] - mapping[b.slotType]);

  return { start: sortedArray.at(0), end: sortedArray.at(-1), sortedArray };
}

function correctTiming(slotInfo: SlotInfo, equipmentSlot: Slot, slotDuration: number) {
  const startOfBooking = parseInt(equipmentSlot.startTime.split(':')[0]);
  const endOfBooking = parseInt(equipmentSlot.endTime.split(':')[0]);
  const startHour = slotInfo.start.getHours();
  const endHour = slotInfo.end.getHours();
  let intervals: { start: number; end: number }[] = [];
  let m = startOfBooking;
  let n = startOfBooking + slotDuration;
  while (m < endOfBooking) {
    if (n <= endOfBooking) {
      intervals.push({ start: m, end: n });
    }
    n = n + slotDuration;
    m = m + slotDuration;
  }

  return intervals.find((item) => startHour >= item.start && endHour <= item.end);
}

// function findRighSlot(slotInfo: SlotInfo, equipmentSlots: Slot[], slotDuration: number) {
//   const selSolt = equipmentSlots.find((slot) => {
//     const interval = correctTiming(slotInfo, slot, slotDuration);
//     const endOfBooking = parseInt(slot.endTime.split(':')[0]);

//     if (interval?.end && interval.end > endOfBooking) {
//       return false;
//     }
//     if (interval) return true;
//   });

//   return selSolt;
// }
