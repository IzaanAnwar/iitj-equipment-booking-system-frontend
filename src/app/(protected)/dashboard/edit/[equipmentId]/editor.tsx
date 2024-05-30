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

export function Editor(props: { state: string; setState: React.Dispatch<React.SetStateAction<string>> }) {
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
    <div className="h-full w-full space-y-4 text-[1rem]">
      <QuillEditor
        theme="snow"
        value={props.state}
        onChange={props.setState}
        modules={modules}
        formats={quillFormats}
        className="h-full min-h-[20vh]   w-full"
      />
    </div>
  );
}
