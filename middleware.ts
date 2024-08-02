// // Protecting routes with next-auth
// // https://next-auth.js.org/configuration/nextjs#middleware
// // https://nextjs.org/docs/app/building-your-application/routing/middleware

// import NextAuth from 'next-auth';
// import authConfig from './auth.config';
// import { NextResponse } from 'next/server';

// const { auth } = NextAuth(authConfig);

// export default auth((req) => {
//   if (true) {
//     // Bypass authentication during development
//     return NextResponse.next();
//   }

//   if (!req.auth) {
//     const url = req.url.replace(req.nextUrl.pathname, '/');
//     return Response.redirect(url);
//   }
// });

// export const config = { matcher: ['/dashboard/:path*'] };

bypassing the auth

import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Bypass authentication during development
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*'], // Adjust this pattern as needed for your routes
};
