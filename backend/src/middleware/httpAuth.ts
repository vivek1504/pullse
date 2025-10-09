// middleware/httpAuth.ts
import type { Request, Response, NextFunction } from 'express';
import { getClerkUserIdFromCookies } from './clerkAuth.js';

export async function httpMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('request reached');
    req.userId = await getClerkUserIdFromCookies(req.headers.cookie);
    next();
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}
