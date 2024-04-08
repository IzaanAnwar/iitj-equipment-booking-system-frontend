'use client';
import { api } from '@/utils/axios-instance';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function Instructions() {
  const [value, setValue] = useState('');

  const instructions = useQuery({
    queryKey: ['get-info'],
    queryFn: async () => {
      const res = await api.get('users/get-instructions');
      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      return (await res.data.text) as { id: string; text: string };
    },
  });
  if (instructions.isPending) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (instructions.isSuccess && value === '') {
    setValue(instructions.data.text);
  }
  if (instructions.data)
    return (
      <main className="space-y-6 px-2 py-8 md:px-16 lg:px-32">
        <div dangerouslySetInnerHTML={{ __html: value }}></div>
      </main>
    );
}
