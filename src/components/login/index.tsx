'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/axios-instance';

export function LoginCard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [toasted, setToasted] = useState<boolean>(false);
  const token = Cookies.get('access_token');
  console.log({ token });

  if (token) {
    router.push('/dashboard');
  }

  const useLogin = useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await api.post('/signin', {
        email,
        password,
      });

      console.log({ res });

      return await res.data;
    },
  });
  if (useLogin.isError && !toasted) {
    console.error({ err: useLogin.error });
    const errorA = useLogin.error as any;
    toast({
      title: errorA?.response?.data?.message || useLogin.error.message,
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useLogin.isSuccess) {
    router.push('/dashboard');
  }

  return (
    <Card className="w-full space-y-3 px-8 py-4 md:max-w-[75%] lg:max-w-[40%] ">
      <CardTitle className="text-2xl font-bold">Login</CardTitle>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input value={userEmail} type="email" name="email" onChange={(e) => setUserEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            value={userPassword}
            type="password"
            name="password"
            onChange={(e) => setUserPassword(e.target.value)}
          />
        </div>
        <Button
          loading={useLogin.isPending}
          disabled={useLogin.isPending}
          className="w-full "
          onClick={() => {
            setToasted(false);
            if (!userEmail || !userPassword) {
              toast({
                title: 'Missing Field',
                variant: 'destructive',
              });
              setToasted(true);
              return;
            }
            useLogin.mutate({ email: userEmail, password: userPassword });
          }}
        >
          Login
        </Button>
      </CardContent>
    </Card>
  );
}
