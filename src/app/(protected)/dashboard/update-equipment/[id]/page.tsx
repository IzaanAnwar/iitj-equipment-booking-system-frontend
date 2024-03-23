'use client';
import { equipmentData } from '@/components/dashboard/bookings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UpdateEquipemnt({ params }: { params: { id: string } }) {
  const [selDate, setSleDate] = useState<Date>();
  const router = useRouter();
  const useGetEquipmentDetails = useQuery({
    queryKey: ['e'],
    queryFn: async () => {
      return equipmentData.find((item) => item.id === params.id);
    },
  });
  if (useGetEquipmentDetails.isPending) {
    return (
      <div className="flex h-full w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  return (
    <main className="px-2 py-8 md:px-16 lg:px-32">
      <Card>
        <CardHeader>
          <CardTitle>{useGetEquipmentDetails.data?.name}</CardTitle>
          <CardDescription>{useGetEquipmentDetails.data?.description}</CardDescription>
          <CardDescription>
            <strong>Location </strong>:{useGetEquipmentDetails.data?.location}
          </CardDescription>
          <CardDescription>
            <strong>Activity Status </strong>:{' '}
            <Badge variant={useGetEquipmentDetails.data?.status === 'active' ? 'default' : 'warning'}>
              {useGetEquipmentDetails.data?.status}
            </Badge>
          </CardDescription>
          {useGetEquipmentDetails.data?.status === 'maintenance' && (
            <CardDescription>
              <strong>Reason </strong>: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi non arcu risus quis.
              Risus at ultrices mi tempus imperdiet nulla.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {useGetEquipmentDetails.data?.status === 'active' && (
            <div className="space-y-3">
              <h5 className="text-xl font-semibold">Update For Maintenance</h5>
              <Label>Reason</Label>
              <Textarea />
              <div className="pt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn('w-[240px] pl-3 text-left font-normal', !selDate && 'text-muted-foreground')}
                    >
                      {selDate ? format(selDate, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selDate}
                      onSelect={(e) => {
                        setSleDate(e);
                      }}
                      disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {useGetEquipmentDetails.data?.status === 'active' ? (
            <Button onClick={() => router.back()}>Update</Button>
          ) : (
            <Button onClick={() => router.back()}>Resume service</Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
