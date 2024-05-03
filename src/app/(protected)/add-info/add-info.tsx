'use client';

import React from 'react';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios-instance';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });
export function AddInformation() {
  const [readonly, setreadonly] = useState(true);
  const [value, setValue] = useState('');
  const [toasted, setToasted] = useState<boolean>(false);
  const modules = {
    toolbar: [
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      [{ align: [] }],
      [{ color: [] }],
      ['clean'],
    ],
  };
  const router = useRouter();
  const updateInstructions = useMutation({
    mutationKey: ['update-info'],
    mutationFn: async () => {
      const res = await api.post('users/update-instructions', {
        text: value,
      });
      if (res.status !== 200) {
        throw new Error(await res.data);
      }
      return await res.data;
    },
  });
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
  if (updateInstructions.isError && !toasted) {
    toast({
      title: 'Oops',
      description: 'Could not save',
      variant: 'destructive',
    });
    setToasted(true);
  }
  if (updateInstructions.isSuccess && !toasted) {
    toast({
      title: 'Saved',
      variant: 'success',
    });
    setToasted(true);
    setreadonly(true);
    router.refresh();
    updateInstructions.reset();
  }
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
  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
    'align',
    'color',
    'code-block',
    'size',
  ];

  return (
    <div className="min-h-[70vh] w-full space-y-4 text-[1rem]">
      <QuillEditor
        readOnly={readonly}
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        formats={quillFormats}
        className="h-full   w-full"
      />
      <div className="flex items-center justify-start gap-4">
        <Button onClick={() => setreadonly(false)} variant={readonly ? 'default' : 'outline'}>
          Edit
        </Button>
        <Button
          loading={updateInstructions.isPending}
          disabled={updateInstructions.isPending}
          onClick={() => {
            setToasted(false);

            if (readonly) {
              toast({
                title: 'No changes made',
                variant: 'destructive',
              });
              return;
            }
            if (!value) {
              toast({
                title: 'No data provided',
                variant: 'destructive',
              });
              return;
            }
            updateInstructions.mutate();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
