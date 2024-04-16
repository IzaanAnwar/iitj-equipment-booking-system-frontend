import { api } from '@/utils/axios-instance';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

export const useSignOut = () =>
  useMutation({
    mutationKey: ['signout'],
    mutationFn: async () => {
      try {
        const res = await api.post('/signout');
        console.log({ res });
        Cookies.remove('access_token');
        if (res.status !== 200) {
          throw new Error('Something went wrong');
        }
      } catch (error) {
        console.error({ error });
      }
    },
  });
