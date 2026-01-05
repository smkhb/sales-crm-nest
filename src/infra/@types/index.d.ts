// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as express from 'express';
import { UserPayload } from '@/infra/auth/jwt-strategy';

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
