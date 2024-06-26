'use client';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommandList } from 'cmdk';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Maintainance } from './maintainance';
import { useGetActiveEquipments, useGetEquipments } from '@/hooks/use-equipments';
import { Equipment } from '../../../types';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';

export function BookingsPage() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>();
  const allEquipments = useGetActiveEquipments();
  console.log({ allEquipmentsA: allEquipments.data });

  console.log({ allEquipments });

  return (
    <main className="space-y-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-base">
            {selectedEquipment ? selectedEquipment.name : 'Select Equipment...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[96vw] p-0 text-base md:w-[72vw] lg:w-[67vw]">
          <Command>
            <CommandInput placeholder="Search Equipment..." />
            <CommandEmpty>No Equipment found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {allEquipments.data?.map((eqipment) => (
                  <CommandItem
                    key={eqipment.id}
                    value={eqipment.name.toLowerCase()}
                    onSelect={(currentValue) => {
                      console.log({ currentValue });

                      setValue(currentValue === value ? '' : currentValue);
                      const item = allEquipments.data.find((eqipment) => eqipment.name.toLowerCase() === currentValue);
                      setSelectedEquipment(item);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === eqipment.name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {eqipment.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="w-full">
        {selectedEquipment ? (
          <EquipmentCard equipment={selectedEquipment} />
        ) : (
          <div className="flex  h-24 items-center justify-center border-2 border-dashed">
            <h5>No Equipment Selelcted</h5>
          </div>
        )}
      </div>
      <Maintainance />
    </main>
  );
}

function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Card className="animate-fade-down animate-duration-200">
      <CardHeader>
        <CardTitle className="text-primary">{equipment.name}</CardTitle>
        <CardDescription
          className="ql-editor"
          dangerouslySetInnerHTML={{ __html: equipment.description }}
        ></CardDescription>
        <CardDescription>
          <strong>Location</strong>: {equipment.place}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription className="space-y-3">
          <strong>Lab Hours</strong>
          {equipment.slots
            .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime))
            ?.map((slot) => {
              const starTime = new Date(slot.startTime)?.toLocaleTimeString('en-IN', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'Asia/Kolkata',
              });
              const endTime = new Date(slot.endTime)?.toLocaleTimeString('en-IN', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'Asia/Kolkata',
              });
              console.log({ typeof: typeof slot.startTime });

              return (
                // <div key={slot.id} className="flex items-center justify-start gap-4">
                //   <p>{slot.slotType === 'MORNING' ? 'EARLY MORNING' : slot.slotType}</p>:{' '}
                //   <strong>{moment.utc(slot.startTime, 'HH:mm:ss.SSSSSS').format('HH:mm')}</strong>
                //   <p>to</p>
                //   <strong>{moment.utc(slot.endTime, 'HH:mm:ss.SSSSSS').format('HH:mm')}</strong>
                //   <p>
                //     at <strong>₹ {slot.slotCost} </strong>
                //   </p>
                // </div>
                <div key={slot.id} className="space-y-1 rounded  p-1">
                  <h3 className="text-lg font-bold text-black">
                    {slot.slotType === 'MORNING' ? 'EARLY MORNING' : slot.slotType}
                  </h3>
                  <div>
                    <p>
                      <strong>Timing</strong> {slot?.startTime.slice(0, 5)} - {slot?.endTime.slice(0, 5)}
                    </p>
                    <p>
                      <strong>Credit</strong>: ₹{slot?.slotCost}
                    </p>
                    <p>
                      <strong>Slot Duration</strong>: {slot?.slotDuration} H
                    </p>
                    <p>
                      <strong>Max Allowed Booking</strong> {slot.maxBookings}
                    </p>
                  </div>
                </div>
              );
            })}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push(`/dashboard/${equipment.id}`)}>Request</Button>
      </CardFooter>
    </Card>
  );
}
