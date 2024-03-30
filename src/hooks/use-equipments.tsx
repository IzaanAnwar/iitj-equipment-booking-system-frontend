import { useQuery } from '@tanstack/react-query';
import { Equipment, EquipmentWithMaintenanceLogs, MaintenanceLogWithEquipment } from '../../types';
import { api } from '@/utils/axios-instance';

export const useGetEquipments = () =>
  useQuery({
    queryKey: ['get-all-equipments'],
    queryFn: async () => {
      const res = await api.get('/equipments/all');
      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });

      return (await res.data.equipments) as Equipment[];
    },
  });
export const useGetActiveEquipments = () =>
  useQuery({
    queryKey: ['get-active-equipments'],
    queryFn: async () => {
      const res = await api.get('/equipments/active');
      console.log({ ACT: res });

      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });

      return (await res.data.equipments) as Equipment[];
    },
  });
export const useGetMaintenanceEquipments = () =>
  useQuery({
    queryKey: ['get-maintenance-equipments'],
    queryFn: async () => {
      const res = await api.get('/equipments/halt');
      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });

      return (await res.data.equipments) as MaintenanceLogWithEquipment[];
    },
  });

export const useGetEquipment = ({ equipmentId }: { equipmentId: string }) =>
  useQuery({
    queryKey: ['get-equipment'],
    queryFn: async () => {
      const res = await api.get(`equipments?id=${equipmentId}`);
      console.log({ resbe: res });

      if (res.status !== 200) {
        throw new Error('Server Error please try after some time');
      }
      console.log({ data: await res.data });

      return (await res.data.equipment) as EquipmentWithMaintenanceLogs;
    },
  });
