'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGetMaintenanceEquipments } from '@/hooks/use-equipments';
import { Loader2 } from 'lucide-react';
import { Skeleton } from 'antd';
import moment from 'moment';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export function Maintainance() {
  const equipments = useGetMaintenanceEquipments();
  if (equipments.isPending) {
    return (
      <div className="flex h-full w-full  items-center justify-center  ">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Equipment in maintenance</CardTitle>
          <CardContent className="space-y-6 py-4">
            {equipments.data &&
              equipments.data.map((item) => {
                return (
                  <div key={item.id}>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          <div className="flex items-center justify-start gap-4">
                            <CardTitle className="text-xl">{item.equipment.name}</CardTitle>{' '}
                            <Badge variant="warning">{item.equipment.status}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CardDescription className="text-base text-gray-800">{item.reason}</CardDescription>
                          <CardTitle className="text-md text-base">
                            Opens on {moment(item.endTime).format('MMMM Do YYYY, h:mm:ss a')}
                          </CardTitle>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                );
              })}
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
