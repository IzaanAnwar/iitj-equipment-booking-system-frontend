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
import { useState } from 'react';
import { EquipmentWithMaintenanceLogs } from '../../../../../../types';
import { toast } from '@/components/ui/use-toast';

export default function EditEquipment({ params }: { params: { equipmentId: string } }) {
  const [name, setName] = useState<string>('');
  const [place, setPlace] = useState<string>('');

  const [description, setDescription] = useState<string>('');
  const [toasted, setToasted] = useState<boolean>(false);
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
  const updateEquipmetnDetails = useMutation({
    mutationKey: ['update-equipment-details', params.equipmentId],
    mutationFn: async () => {
      const res = await api.post('/equipments/update', {
        id: params.equipmentId,
        name,
        place,
        description,
      });
      console.log({ res });

      if (res.status !== 200) {
        throw new Error(res.data);
      }
      console.log('here');

      return res.data;
    },
  });
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
  if (updateEquipmetnDetails.isError && !toasted) {
    toast({
      title: 'Error',
      // @ts-ignore
      description: updateEquipmetnDetails.error?.response?.data?.message || 'Could not update',
      variant: 'destructive',
    });
    setToasted(true);
  }
  return (
    <main className="px-2 py-12 md:px-10 lg:px-20">
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
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-start gap-4">
          <Button
            onClick={() => {
              setToasted(false);
              if (!name && !place && !description) {
                toast({
                  title: 'No data provided to update',
                  variant: 'destructive',
                });
                return;
              }
              updateEquipmetnDetails.mutate();
            }}
            loading={updateEquipmetnDetails.isPending}
            disabled={updateEquipmetnDetails.isPending}
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
