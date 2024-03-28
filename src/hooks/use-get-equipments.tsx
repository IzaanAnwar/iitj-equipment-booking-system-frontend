import { useQuery } from '@tanstack/react-query';
import { Equipment } from '../../types';
import { api } from '@/utils/axios-instance';

export const useGetEquipments = () =>
  useQuery({
    queryKey: ['get-all-equipments'],
    queryFn: async () => {
      const res = await api.get('/equipments');
      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });

      return (await res.data.equipments) as Equipment[];
    },
  });
