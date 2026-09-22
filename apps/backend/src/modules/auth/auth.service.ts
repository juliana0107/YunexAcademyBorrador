import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../../shared/errors/http-error.js';
import { ErrorCode } from '../../shared/errors/error-codes.js';
import { comparePassword } from '../../shared/utils/password.util.js';
import * as repo from './auth.repository.js';
import { toAuthUser } from './auth.mapper.js';
import type { LoginInput } from './auth.schema.js';
import type { LoginResult, AuthUser, JwtPayload } from './auth.types.js';

export async function login(input: LoginInput): Promise<LoginResult> {
  const user = await repo.findByEmailWithRoles(input.email);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials', ErrorCode.AUTH_INVALID_CREDENTIALS);
  }

  if (user.status !== 'ACTIVE') {
    throw new ForbiddenError(
      user.status === 'SUSPENDED'
        ? 'Your account has been suspended'
        : 'Your account is inactive'
    );
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid credentials', ErrorCode.AUTH_INVALID_CREDENTIALS);
  }

  const accessToken = signToken({
    sub: user.id,
    email: user.email,
    roles: user.roles,
  });

  await repo.updateLastLogin(user.id);

  return {
    user: toAuthUser(user),
    tokens: { accessToken },
  };
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await repo.findByIdWithRoles(userId);
  if (!user) throw new NotFoundError('User not found');
  return toAuthUser(user);
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired', ErrorCode.AUTH_TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid token', ErrorCode.AUTH_TOKEN_INVALID);
  }
}