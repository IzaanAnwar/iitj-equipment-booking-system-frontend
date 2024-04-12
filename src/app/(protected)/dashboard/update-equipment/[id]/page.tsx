'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { api } from '@/utils/axios-instance';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Equipment, EquipmentWithMaintenanceLogs } from '../../../../../../types';
import { DatePicker } from 'antd';
import moment from 'moment';
import { toast } from '@/components/ui/use-toast';
import { useGetEquipment } from '@/hooks/use-equipments';

export default function UpdateEquipemnt({ params }: { params: { id: string } }) {
  const [selDate, setSelDate] = useState<Date>();
  const [toasted, setToasted] = useState<boolean>(false);
  const [reason, setReason] = useState<string>();
  const router = useRouter();
  const useGetEquipmentDetails = useGetEquipment({ equipmentId: params.id });
  const useStartMaintainenance = useMutation({
    mutationKey: ['start-maintenance'],
    mutationFn: async () => {
      const res = await api.post('/equipments/maintain', {
        equipmentId: params.id,
        reason: reason,
        endTime: selDate,
      });
      if (res.status === 200) {
        return await res.data;
      }
      throw new Error(await res.data);
    },
  });
  const useStartWorking = useMutation({
    mutationKey: ['start-working'],
    mutationFn: async () => {
      const res = await api.post('/equipments/activate', {
        equipmentId: params.id,
      });
      if (res.status === 200) {
        return await res.data;
      }
      throw new Error(await res.data);
    },
  });
  if (useGetEquipmentDetails.isPending) {
    return (
      <div className="flex h-screen w-full  items-center justify-center  ">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (useStartMaintainenance.isSuccess && !toasted) {
    toast({
      title: 'Success',
      description: 'Equipment added successfully for maintenance',
      variant: 'success',
    });
    setToasted(true);
    router.push('/dashboard');
  }
  if (useStartWorking.isSuccess && !toasted) {
    toast({
      title: 'Success',
      description: 'Successfully started Equipment operations',
      variant: 'success',
    });
    setToasted(true);
    router.push('/dashboard');
  }
  return (
    <main className="px-2 py-8 md:px-16 lg:px-32">
      <Card>
        <CardHeader>
          <CardTitle>{useGetEquipmentDetails.data?.name}</CardTitle>
          <CardDescription>{useGetEquipmentDetails.data?.description}</CardDescription>
          <CardDescription>
            <strong>Location </strong>: {useGetEquipmentDetails.data?.place}
          </CardDescription>
          <CardDescription>
            <strong>Activity Status </strong>:{' '}
            <Badge variant={useGetEquipmentDetails.data?.status === 'active' ? 'active' : 'warning'}>
              {useGetEquipmentDetails.data?.status}
            </Badge>
          </CardDescription>
          {useGetEquipmentDetails.data?.status === 'maintenance' && (
            <CardDescription>
              <strong>Reason </strong>: {useGetEquipmentDetails.data.maintenanceLog?.reason || 'NA'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {useGetEquipmentDetails.data?.status === 'active' && (
            <div className="space-y-3">
              <h5 className="text-xl font-semibold">Update For Maintenance</h5>
              <Label>Reason</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="pt-2">
                <DatePicker
                  format="DD/MM/YYYY hh:mm A"
                  onChange={(date) => {
                    setSelDate(date.toDate());
                  }}
                  showTime={{ use12Hours: true }}
                  disabledDate={(current) => {
                    return current && current.valueOf() < moment().startOf('day').valueOf();
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {useGetEquipmentDetails.data?.status === 'active' ? (
            <Button
              loading={useStartMaintainenance.isPending}
              disabled={useStartMaintainenance.isPending}
              onClick={() => {
                setToasted(false);
                if (!reason || !selDate || !params.id) {
                  toast({
                    title: 'Invalid data provided',
                    description: 'Please select a proper date and reason',
                    variant: 'destructive',
                  });
                  setToasted(true);
                }
                useStartMaintainenance.mutate();
              }}
            >
              Update
            </Button>
          ) : (
            <Button
              loading={useStartWorking.isPending}
              disabled={useStartWorking.isPending}
              onClick={() => {
                setToasted(false);
                if (!params.id) {
                  toast({
                    title: 'Invalid Operation',
                    variant: 'destructive',
                  });
                  setToasted(true);
                }
                useStartWorking.mutate();
              }}
            >
              Resume service
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
