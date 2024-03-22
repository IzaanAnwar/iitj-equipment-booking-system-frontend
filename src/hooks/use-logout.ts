import { api } from "@/utils/axios-instance";
import { useMutation } from "@tanstack/react-query";

export const useSignOut = () => useMutation({
    mutationKey: ['signout'],
    mutationFn: async () => {
      try {
        const res = await api.post('/signout');
        console.log({ res });

        if (res.status !== 200) {
          throw new Error('Something went wrong');
        }
      } catch (error) {
        console.error({ error });
      }
    },
  });