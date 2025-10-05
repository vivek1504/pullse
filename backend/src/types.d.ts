import { Socket as BaseSocket } from 'socket.io';
import type { User } from '@clerk/express';

declare module 'socket.io' {
  interface Socket {
    user: Jwtpayload | null;
  }
}
