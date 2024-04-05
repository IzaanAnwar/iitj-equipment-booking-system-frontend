export type Slot = {
  startTime: string;
  endTime: string;
  id: string;
  equipmentId: string;
  slotCost: number;
  slotType: 'DAY' | 'EVENING' | 'NIGHT';
};

export type Equipment = {
  name: string;
  description: string;
  place: string;
  status: 'active' | 'maintenance';
  id: string;
  slotDuration: number;
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
  };
}

export type Student = {
  id: string;
  name: string;
  email: string;
  roll: number;
  role: 'user' | null;
  department: string | null;
  supervisorId: string;
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
export type Supervisor = {
  id: string;
  name: string;
  email: string;
  department: string | null;

  departmentId: string | null;
  role: 'supervisor' | null;
};

export interface IEvent {
  equipmentId: string;
  remark: string;
  slotDuration: number;
  userId: string;
  cost: number;
  status: 'fulfilled' | 'pending' | 'cancelled';
  id: string;
  slotTimeStart: Date;
  slotTimeEnd: Date;
  bookedAt: Date | null;
  start: unknown;
  end: unknown;
  equipment: {
    slotDuration: number;
    name: string;
    description: string;
  };
}

export interface IReport {
  equipmentId: string;
  remark: string;
  slotDuration: number;
  userId: string;
  cost: number;
  status: 'fulfilled' | 'pending' | 'cancelled';
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
  };
}

export interface IAccountDetails {
  name: string;
  email: string;
  department: string | null;
  role: 'admin' | 'supervisor' | 'user' | null;
  id: string;
  roll: number | null;
  departmentId: string | null;
  supervisorId: string | null;
  supervisor: User | null;
  token: number;
}
