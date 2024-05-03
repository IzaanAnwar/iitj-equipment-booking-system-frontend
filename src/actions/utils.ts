'use server';

import { api } from '@/utils/axios-instance';

export async function getInstructionsHistory() {
  try {
    const res = await api.get('users/get-instructions/history');
    if (res.status !== 200) {
      throw new Error(res.data);
    }
    const data = res.data.data as { id: string; text: string; changedBy: string; updatedAt: string }[];
    console.log({ data });

    return { success: true, data };
  } catch (error: any) {
    console.log({ error });

    const err = error?.response?.data?.message || 'Internal server error';
    return { success: false, data: null };
  }
}
