'use server';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '../../types';

dotenv.config();

export async function getSession() {
  console.log('Session');

  const secret = process.env.JWT_SECRET;
  console.log({ secret });

  if (!secret) return null;
  const cookiesList = cookies();

  // const token = cookiesList.get('access_token');
  const role = cookiesList.get('role');
  if (role?.value === 'admin') {
    return {
      userId: '285b4906-1368-40a0-bfb0-c01f58d3accb',
      role: 'admin',
      supervisorId: null,
      name: 'Rahul',
    } as User;
  } else if (role?.value === 'user') {
    return {
      userId: 'e6d90d5e-5bd8-4bce-91a7-1f16e9351519',
      role: 'user',
      supervisorId: null,
      name: 'Izaan',
    };
  } else return null;
  // console.log({mytokrn:token});

  // if (!token) return null;

  // const decoded = jwt.verify(token?.value, secret) as unknown;
  // return decoded as User;
}
