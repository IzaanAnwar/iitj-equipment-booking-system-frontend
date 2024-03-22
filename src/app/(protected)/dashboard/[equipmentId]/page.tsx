'use client';

import { equipmentData } from '@/components/dashboard/bookings';
import { useQuery } from '@tanstack/react-query';
import { Calendar, SlotInfo, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { events } from '@/utils/events';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function BookEquipment({ params }: { params: { equipmentId: string } }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo>();
  const [dailogOpen, setdailogOpen] = useState(false);
  const [selectEq, setSelectedEq] = useState<any>();
  const useGetEquipmentDetails = useQuery({
    queryKey: ['get-equipment-data'],
    queryFn: async () => {
      //   const item = equipmentData.find((item) => item.id === params.eqipmentId);
      return events.filter((event) => event.instrumentId === params.equipmentId);
      //   if (item) return item;
      //   else throw new Error('Could not Find The Equipment Details');
    },
  });

  const eventStyleGetter = (event: {
    id: number;
    instrumentId: string;
    title: string;
    start: Date;
    end: Date;
    available: boolean;
  }) => {
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6; // Check for Sat/Sun
    console.log({ event });
    setSelectedEq(event);
    let style = {
      backgroundColor: 'inherit',
    };

    if (!event.available) {
      style.backgroundColor = 'red';
    }
    // else {
    //   style.backgroundColor = 'green';
    // }

    return { style };
  };
  const localizer = momentLocalizer(moment);
  console.log({ data: useGetEquipmentDetails.data, params });

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
          // @ts-ignore
          events={useGetEquipmentDetails.data}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          startAccessor="start"
          endAccessor="end"
          step={3}
          timeslots={20}
          selectable
          // selected={selectedSlot?.slots}
          // onSelectEvent={(e) => {
          //   console.log({ eventSecl: e });
          // }}
          onSelectSlot={(e) => {
            console.log({ slotSeclected: e });
            const now = new Date(); // Get the current date and time
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Represents today at midnight

            const dateObj = e.start;
            if (dateObj.getTime() <= today.getTime()) {
              return;
            }
            if (!selectEq) {
              return;
            }
            const available = useGetEquipmentDetails.data?.find((item) => item.instrumentId === selectEq.instrumentId);
            // Check if the time is after 5 PM (17:00)
            if (!available?.available) return;
            const hours = dateObj.getHours();
            if (hours >= 17) return;
            if (hours < 9) return;
            setSelectedSlot(e);
            setdailogOpen(true);
          }}
          eventPropGetter={eventStyleGetter}
          defaultView="week"
          // defaultDate={new Date(2024, 2, 23, 9, 0)}
          min={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9)}
          max={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18)}
        />
        {selectedSlot && (
          <AlertDialog open={dailogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Please confirm your booking</AlertDialogTitle>
                <AlertDialogDescription>
                  <Card>
                    <CardContent className="p-4">
                      <CardDescription>Equipment {useGetEquipmentDetails.data?.at(0)?.name}</CardDescription>
                      <CardDescription>
                        Your slot is from {selectedSlot?.slots.at(0)?.getHours()} to{' '}
                        {Number(selectedSlot?.slots.at(-1)?.getHours()) + 1}
                      </CardDescription>
                      <div className="space-y-2 pt-4">
                        <Label>Remarks</Label>
                        <Textarea placeholder="remark" />
                      </div>
                    </CardContent>
                  </Card>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setdailogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    toast({
                      title: 'Equipment Booked',
                      variant: 'success',
                    });

                    setTimeout(() => {
                      setdailogOpen(false);
                      router.push('/dashboard');
                    }, 1000);
                  }}
                >
                  Confirm Booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </main>
    </>
  );
}
