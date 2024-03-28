export type Slot = {
  startTime: string;
  endTime: string;
  id: string;
  equipmentId: string;
  slotType: 'DAY' | 'EVENING' | 'NIGHT';
};

export type Equipment = {
  name: string;
  description: string;
  place: string;
  status: 'active' | 'maintenance';
  id: string;
  slotDuration: number;
  tokens: number;
  slots: Slot[];
};

export type MaintenanceLog = {
  startTime: string;
  endTime: string;
  id: number;
  equipmentId: string;
  reason: string;
};

export interface EquipmentWithMaintenanceLogs extends Equipment {
  maintenanceLog?: MaintenanceLog;
}

export type Student = {
  id: string;
  name: string;
  email: string;
  roll: number;
  role: 'user' | 'supervisor' | 'admin' | null;
};

export interface StudentWithSupervisor extends Student {
  supervisor: Student[];
}

export type User = {
  userId: string | null;
  name: string | null;
  role: 'admin' | 'supervisor' | 'user' | null;
  supervisorId: string | null;
  iat: string;
  exp: string;
};

export interface IEvent {
  equipmentId: string;
  slotDuration: Date;
  userId: string;
  id: number;
  startDatetime: Date;
  endDatetime: Date;
  bookedAt: Date | null;
  start: unknown;
  end: unknown;
  equipment: {
    slotDuration: number;
    name: string;
    description: string;
    tokens: number;
  };
}
