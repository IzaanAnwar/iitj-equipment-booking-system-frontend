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
export const events = [
  {
    id: 1,
    instrumentId: '1',
    // title: 'NMR Spectrometer - Slot Available',
    start: new Date(2024, 2, 23, 9, 0),
    end: new Date(2024, 2, 23, 9, 30),
    available: true,
  },
  {
    id: 2,

    instrumentId: '2',
    // title: 'UV-Vis Spectrophotometer - Slot Available',
    start: new Date(2024, 2, 22, 10, 0),
    end: new Date(2024, 2, 22, 10, 30),
    available: true,
  },
  {
    id: 3,

    instrumentId: '1',
    // title: 'NMR Spectrometer - Booked',
    start: new Date(2024, 2, 26, 13, 0),
    end: new Date(2024, 2, 26, 13, 30),
    available: false,
  },
];
export default function BookEquipment({ params }: { params: { equipmentId: string } }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo>();

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
        timeslots={10}
        selectable
        // selected={selectedSlot?.slots}
        // onSelectEvent={(e) => {
        //   console.log({ eventSecl: e });
        // }}
        onSelectSlot={(e) => {
          console.log({ slotSeclected: e });
          setSelectedSlot(e);
        }}
        eventPropGetter={eventStyleGetter}
        defaultView="week"
        // defaultDate={new Date(2024, 2, 23, 9, 0)}
        min={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9)}
        max={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18)}
      />
      {selectedSlot && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Book</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Please confirm your booking</AlertDialogTitle>
              <AlertDialogDescription>
                <Card>
                  <CardContent className="p-4">
                    <CardDescription>Equipment XYZs</CardDescription>
                    <CardDescription>
                      Your slot is from {selectedSlot?.slots.at(0)?.getHours()}:
                      {selectedSlot?.slots.at(-1)?.getMinutes()} to {selectedSlot?.slots.at(-1)?.getHours()}:
                      {selectedSlot?.slots.at(-1)?.getMinutes()}
                    </CardDescription>
                  </CardContent>
                </Card>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  toast({
                    title: 'Equipment Booked',
                    variant: 'success',
                  });
                  setTimeout(() => {
                    router.push('/dashboard');
                  }, 1000);
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </main>
  );
}
