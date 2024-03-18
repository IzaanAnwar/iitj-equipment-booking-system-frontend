export type Equipment = {
  id: string;
  name: string;
  status: 'available' | 'booked' | 'maintenance' | null;
  description: string;
  quantity: number;
  tokens: number | null;
};

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
