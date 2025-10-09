import { verifyToken } from '@clerk/express';
import cookie from 'cookie';

export async function getClerkUserIdFromCookies(cookieHeader?: string) {
  if (!cookieHeader) throw new Error('No cookies found');

  const cookies = cookie.parse(cookieHeader);
  const sessionToken = cookies['__session'];
  if (!sessionToken) throw new Error('Missing Clerk session token');

  if (!process.env.CLERK_JWT_KEY) throw new Error('CLERK_JWT_KEY not set');
  const jwtKey = process.env.CLERK_JWT_KEY.replace(/\\n/g, '\n');

  const session = await verifyToken(sessionToken, {
    jwtKey,
    authorizedParties: ['http://localhost:5173'],
  });

  return session.sub;
}
