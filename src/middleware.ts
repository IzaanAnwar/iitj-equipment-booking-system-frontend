export const DEFAULT_LOGIN_REDIRECT: string = '/dashboard';
const USER_RESTRICTED_ROUTES = ['/add-students', '/add-equipment', '/students'];
import { NextRequest, NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { User } from '../types/index';

// export const runtime = 'node';
// async function pareseToken({ cookies }: { cookies: string }) {
//   const secret = '1b910a6fe3eed96d1a6cf8e490dbb467';
//   if (!secret) return null;

//   const decoded = jwt.verify(cookies, secret) as unknown;
//   return decoded as User;
// }

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const cookiesList = req.headers.get('cookie');
  console.log({ cookiesList });

  const token = cookiesList?.split('=').at(1);
  console.log({ token });

  //   const user = await pareseToken({ cookies: token! });
  const isLoggedIn = !!token;
  console.log({ isLoggedIn });

  const currUrl = nextUrl.pathname;
  const isUserRestrictedRoute = USER_RESTRICTED_ROUTES.includes(currUrl);

  if (isLoggedIn && currUrl === '/') {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }
  //   if (isLoggedIn && user.role === 'user') {
  //     if (isUserRestrictedRoute) {
  //       return NextResponse.redirect(new URL(`/dashboard`, nextUrl));
  //     }
  //   }

  if (!isLoggedIn && currUrl !== '/') {
    return NextResponse.redirect(new URL(`/`, nextUrl));
  }

  return null;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
