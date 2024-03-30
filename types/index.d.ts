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

export interface MaintenanceLogWithEquipment {
  startTime: string;
  endTime: string;
  id: number;
  equipmentId: string;
  reason: string;
  equipment: {
    name: string;
    description: string;
    place: string;
    status: 'active' | 'maintenance';
    id: string;
    slotDuration: number;
    tokens: number;
  };
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

export interface User {
  userId: string | null;
  name: string | null;
  role: 'admin' | 'supervisor' | 'user' | null;
  supervisorId: string | null;
  iat: string;
  exp: string;
}

export interface IEvent {
  equipmentId: string;
  slotDuration: Date;
  userId: string;
  id: number;
  slotTimeStart: string;
  slotTimeEnd: string;
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

export interface IReport {
  equipmentId: string;
  remark: string;
  slotDuration: number;
  userId: string;
  id: string;
  slotTimeStart: string;
  slotTimeEnd: string;
  bookedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    roll: number | null;
    department: string | null;
    departmentId: string | null;
    role: 'user' | 'supervisor' | 'admin' | null;
    supervisorId: string | null;
  };
  equipment: {
    slotDuration: number;
    status: 'active' | 'maintenance';
    id: string;
    name: string;
    place: string;
    description: string;
    tokens: number;
  };
}

export interface IAccountDetails extends User {
  supervisor: User | null;
  token: number;
}
