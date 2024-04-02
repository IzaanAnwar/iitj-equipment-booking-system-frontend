import { api } from '@/utils/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { Student, Supervisor, User } from '../../types';

export const useGetAllSupervisors = (filterId = '') =>
  useQuery({
    queryKey: ['get-all-supervisors'],
    queryFn: async () => {
      const res = await api.get('/users/supervisors/all');

      if (res.status === 200) {
        const supervisors = (await res.data.supervisors) as Supervisor[];
        if (filterId) {
          const filteredSupervisor = supervisors.filter((item) => item.id !== filterId);
          return filteredSupervisor;
        }
        return supervisors;
      }
      throw new Error('Something went wrong');
    },
  });

export const useGetStudent = ({ studentId }: { studentId: string }) =>
  useQuery({
    queryKey: ['get-student'],
    queryFn: async () => {
      const res = await api.get(`/users/student?studentId=${studentId}`);
      if (res.status === 200) {
        return (await res.data.student) as Student;
      }
      throw new Error('Something went wrong');
    },
  });
export const useGetStudentBySupervisorId = ({ supervisorId }: { supervisorId: string }) => {
  return useQuery({
    queryKey: ['get-students-by-supervisorId'],
    queryFn: async () => {
      const res = await api.get(`/users/students?supervisorId=${supervisorId}`);
      if (res.status === 200) {
        return (await res.data.students) as Student[];
      }
      throw new Error('Something went wrong');
    },
  });
};
