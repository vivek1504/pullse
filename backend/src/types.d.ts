import { Socket as BaseSocket } from 'socket.io';
import type { Request } from 'express';
import type { User } from '@clerk/express';

declare module 'socket.io' {
  interface Socket {
    userId: string;
  }
}

declare module 'express' {
  interface Request {
    userId?: string;
  }
}
