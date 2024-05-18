export type Slot = {
  startTime: string;
  endTime: string;
  id: string;
  equipmentId: string;
  slotCost: number;
  slotDuration: number;
  slotType: 'MORNING' | 'DAY' | 'EVENING' | 'NIGHT';
};

export type Department = {
  id: string;
  name: string;
};

export type Equipment = {
  name: string;
  description: string;
  place: string;
  status: 'active' | 'maintenance' | 'retired';
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
  departmentId: string | null;
  supervisorId: string;
  department: {
    id: string;
    name: string;
  } | null;
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
  departmentId: string | null;
  uid: string | null;
  department: {
    id: string;
    name: string;
  } | null;
  role: 'supervisor' | null;
  amount?: number;
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
  supervisorId: string;
  id: string;
  departmentId: string;
  status: 'fulfilled' | 'pending' | 'cancelled';
  slotDuration: number;
  equipmentId: string;
  userId: string;
  remark: string;
  slotTimeStart: Date;
  slotTimeEnd: Date;
  cost: number;
  bookedAt: Date | null;
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
  id: string;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
  password: string;
  roll: number | null;
  departmentId: string | null;
  uid: string | null;
  role: 'user' | 'supervisor' | 'admin' | null;
  supervisorId: string | null;
  department: {
    id: string;
    name: string;
  } | null;
  supervisor: User | null;
  token: number;
}
