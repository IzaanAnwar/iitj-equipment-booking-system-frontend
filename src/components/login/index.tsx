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
import Image from 'next/image';

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
      // const res = await api.post('/signin', {
      //   email,
      //   password,
      // });
      if (email === 'user@email.com' && password === 'test123') {
        Cookies.set('role', 'user');
        return {
          user: {
            userId: 'e6d90d5e-5bd8-4bce-91a7-1f16e9351519',
            role: 'user',
            supervisorId: null,
            name: 'Izaan',
            iat: 1711138106,
            exp: 1711224506,
          },
        };
      } else if (email === 'admin@email.com' && password === 'test123') {
        Cookies.set('role', 'admin');

        return {
          user: {
            userId: '285b4906-1368-40a0-bfb0-c01f58d3accb',
            role: 'admin',
            supervisorId: null,
            name: 'Rahul',
            iat: 1711138275,
            exp: 1711224675,
          },
        };
      } else {
        throw new Error('Invalid Credentials');
      }
      // console.log({ res });

      // return await res.data;
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
    // Cookies.set('access_token', useLogin.data.access_token);
    router.push('/dashboard');
  }

  return (
    <Card className="w-full space-y-3 px-8 py-4 md:max-w-[80%] lg:max-w-[70%] ">
      <CardContent className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="order-2 col-span-1 space-y-6 md:order-1">
          <CardTitle className="text-center text-3xl font-bold">Login</CardTitle>
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
            type="submit"
            // onKeyDown={(e) => {
            //   console.log(e);

            //   if (e.key !== 'Enter') {
            //     return;
            //   }
            //   setToasted(false);
            //   if (!userEmail || !userPassword) {
            //     toast({
            //       title: 'Missing Field',
            //       variant: 'destructive',
            //     });
            //     setToasted(true);
            //     return;
            //   }
            //   useLogin.mutate({ email: userEmail, password: userPassword });
            // }}
            onClick={() => {
              console.log('I am clicked');

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
        </div>
        <div className="order-1 col-span-1 max-h-full  overflow-clip md:order-2">
          <Image
            src="/login-page.jpg"
            alt="Equipment Vector"
            width={1080}
            height={720}
            className="h-full w-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}
