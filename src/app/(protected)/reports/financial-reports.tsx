'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios-instance';
import type { FinanceReport, User, Department } from '../../../../types';
import FinancialReportsTable from './financial-reports-table';
import { useGetAllSupervisors, useGetStudentBySupervisorId } from '@/hooks/use-users';
import { useGetEquipments } from '@/hooks/use-equipments';

export function FinanceReportList({ user }: { user: User }) {
  const [toasted, setToasted] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ['all-departments'],
    queryFn: async () => {
      const res = await api.get('/users/departments');
      if (res.status === 200) {
        return res.data.departments as Department[];
      } else {
        throw new Error(res.data);
      }
    },
  });

  const { data: supervisors } = useGetAllSupervisors();
  const { data: students } = useGetStudentBySupervisorId({ supervisorId: user.userId! });
  const { data: equipments } = useGetEquipments();

  const {
    data: reports,
    isPending,
    isError,
  } = useQuery<FinanceReport[]>({
    queryKey: ['finance-report'],
    queryFn: async () => {
      const res = await api.get(`/equipments/reports/finances`);
      if (res.status !== 200) {
        throw new Error(res.data);
      }
      return res.data.reports ?? [];
    },
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError && !toasted) {
    toast({
      title: 'Error fetching finance reports',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    setToasted(true);
  }

  return (
    <div className="w-ful">
      <FinancialReportsTable
        reports={reports ?? []}
        departments={departments ?? []}
        supervisors={supervisors ?? []}
        students={students ?? []}
        equipments={equipments ?? []}
        user={user}
        isPending={isPending}
      />
    </div>
  );
}
