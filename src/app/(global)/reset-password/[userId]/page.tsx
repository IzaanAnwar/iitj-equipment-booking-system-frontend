'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Cookies from 'js-cookie';

import { useRouter } from 'next/navigation';
import { api } from '@/utils/axios-instance';
import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

export default function ResetPasswordPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [toasted, setToasted] = useState<boolean>(false);
  const token = Cookies.get('access_token');

  if (token) {
    router.push('/dashboard');
  }
  const useResetPassword = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const res = await api.post('/reset-password', {
        newPassword,
        userId: params.userId,
      });
      if (res.status === 200) {
        return await res.data;
      } else {
        throw new Error(await res.data);
      }
    },
  });

  if (useResetPassword.isError && !toasted) {
    console.error({ err: useResetPassword.error });
    const errorA = useResetPassword.error as any;
    toast({
      title: errorA?.response?.data?.message || useResetPassword.error.message,
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (useResetPassword.isSuccess && !toasted) {
    toast({
      title: 'Password Reset Sucess',
      variant: 'success',
    });
    setToasted(true);
    setNewPassword('');
    setUserPassword('');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  }

  return (
    <main className="h-[100vh] w-full space-y-8 bg-[#0568c1] text-base">
      <Header />
      <div className="flex    items-center justify-center px-2 md:px-16 lg:px-32">
        <Card className="w-full space-y-3 px-8 py-4 md:max-w-[80%] lg:max-w-[70%] ">
          <CardContent className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <form
              className="order-2 col-span-1 space-y-6 md:order-1"
              onSubmit={(e) => {
                e.preventDefault();
                setToasted(false);
                if (!newPassword || !userPassword) {
                  toast({
                    title: 'Missing Field',
                    variant: 'destructive',
                  });
                  setToasted(true);
                  return;
                }
                if (newPassword !== userPassword) {
                  toast({
                    title: 'Password does not match',
                    variant: 'destructive',
                  });
                  setToasted(true);
                  return;
                }

                useResetPassword.mutate({ newPassword });
              }}
            >
              <CardTitle className="text-center text-3xl font-bold">Reset Password</CardTitle>
              <div className="space-y-2">
                <Label htmlFor="email">New Password</Label>
                <Input
                  value={userPassword}
                  name="password"
                  type="text"
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Confirm Password</Label>
                <Input
                  value={newPassword}
                  type="password"
                  name="new-password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button
                loading={useResetPassword.isPending}
                disabled={useResetPassword.isPending}
                className="w-full "
                type="submit"
              >
                Reset Password
              </Button>
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
      </div>
    </main>
  );
}
function Header() {
  return (
    <div className="flex items-center justify-center gap-12 pt-12 text-white">
      <Image src={'/crdsi_logo.png'} alt="crdsi logo" width={100} height={100} />
      <div className="flex items-center justify-center gap-2 text-4xl font-semibold">
        <h3 className="font-bold">CRDSI</h3>
        <p>Equipment Booking System</p>
      </div>
    </div>
  );
}
