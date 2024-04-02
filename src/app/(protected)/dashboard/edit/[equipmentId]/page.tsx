'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useGetEquipment } from '@/hooks/use-equipments';

export default function EditEquipment({ params }: { params: { equipmentId: string } }) {
  const equipment = useGetEquipment(params);
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
              <Input />
            </div>

            <div className="w-full space-y-2">
              <Label>Place</Label>
              <Input />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-4">
          <Button className="" variant={'destructive'}>
            Remove Equipment from service
          </Button>
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
