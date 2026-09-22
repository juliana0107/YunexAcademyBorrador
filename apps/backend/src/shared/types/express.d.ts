import type { RoleName } from '@yunexacademy/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: RoleName[];
      };
    }
  }
}

export {};