'use server';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '../../types';

dotenv.config();

export async function getSession() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const cookiesList = cookies();
  const token = cookiesList.get('access_token');
  if (!token) return null;

  const decoded = jwt.verify(token?.value, secret) as unknown;
  return decoded as User;
}
