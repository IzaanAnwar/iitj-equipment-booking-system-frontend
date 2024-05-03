'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/utils/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import moment from 'moment';

export function InstructionsHistory() {
  const instructions = useQuery({
    queryKey: ['get-info-history'],
    queryFn: async () => {
      const res = await api.get('users/get-instructions/history');
      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      const data = res.data?.data as { id: string; text: string; changedBy: string; updatedAt: string }[];
      return data;
    },
  });
  if (instructions.isPending) {
    return (
      <div className=" h-fit w-full ">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  return (
    <div>
      <Accordion type="single" collapsible className="mb-4 w-full border px-4">
        <AccordionItem value="history">
          <AccordionTrigger>View change log</AccordionTrigger>
          <AccordionContent>
            {instructions.data ? (
              instructions.data.map((hist) => {
                const ago = moment(hist.updatedAt).fromNow();
                return (
                  <div key={hist.id} className="flex w-full items-center justify-start gap-4 space-y-2 text-base">
                    <p className="font-medium text-cyan-950">{hist?.changedBy}</p>{' '}
                    <p className="text-zinc-700"> {ago}</p>
                  </div>
                );
              })
            ) : (
              <p>No Logs</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
