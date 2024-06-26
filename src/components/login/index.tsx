'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/axios-instance';
import Image from 'next/image';
import Link from 'next/link';

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
  const useForgotPassword = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async ({ email }: { email: string }) => {
      const res = await api.post('/forgot-password', {
        email,
      });
      console.log({ res });

      if (res.status === 200) {
        return await res.data;
      } else {
        throw new Error(await res.data);
      }
    },
  });

  const useLogin = useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await api.post('/signin', {
        email,
        password,
      });
      if (res.status === 200) {
        const token = await res.data.token;
        if (!token) throw new Error('Access Token not found');
        Cookies.set('access_token', token);
        return await res.data;
      } else {
        throw new Error(await res.data);
      }
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
  if (useForgotPassword.isSuccess && !toasted) {
    toast({
      title: 'Check your inbox to reset your password',
      variant: 'success',
    });
    setToasted(true);
  }
  if (useForgotPassword.isError && !toasted) {
    toast({
      title: 'Email not sent',
      variant: 'destructive',
    });
    setToasted(true);
  }

  return (
    <Card className="w-full space-y-3 px-8 py-4 md:max-w-[80%] lg:max-w-[70%] ">
      <CardContent className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <form
          className="order-2 col-span-1 space-y-6 md:order-1"
          onSubmit={(e) => {
            e.preventDefault();
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
            onKeyDown={(e) => {
              console.log(e);
            }}
          >
            Login
          </Button>
          <Link
            href="#"
            className="pt-2 text-primary underline"
            onClick={() => {
              setToasted(false);
              if (!userEmail) {
                toast({
                  title: 'Please provide email',
                  variant: 'destructive',
                });
                setToasted(true);

                return;
              }
              useForgotPassword.mutate({ email: userEmail });
              console.log('mut');
            }}
          >
            {useForgotPassword.isPending ? 'Sending...' : 'Forgot Password?'}
          </Link>
        </form>
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
