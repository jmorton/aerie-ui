import { jwtDecode } from 'jwt-decode';
import { randomBytes, createHash } from 'crypto';
import type { BaseUser, ParsedUserToken, User } from '../types/app';
import effects from './effects';

export function generateCodeVerifier(): string {
  return base64Url(randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  return base64Url(createHash('sha256').update(verifier).digest());
}

function base64Url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export async function computeRolesFromJWT(
  baseUser: BaseUser,
  activeRole: string | null,
): Promise<User | null> {
  const { success } = await effects.session(baseUser);
  if (!success) {
    return null;
  }

  const decodedToken: ParsedUserToken = jwtDecode(baseUser.token);

  const allowedRoles =
    decodedToken['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'];
  const defaultRole =
    decodedToken['https://hasura.io/jwt/claims']['x-hasura-default-role'];

  const user: User = {
    ...baseUser,
    activeRole: activeRole ?? defaultRole,
    allowedRoles,
    defaultRole,
    permissibleQueries: null,
    rolePermissions: null,
  };
  const permissibleQueries = await effects.getUserQueries(user);
  const rolePermissions = await effects.getRolePermissions(user);
  return {
    ...user,
    permissibleQueries,
    rolePermissions,
  };
}

export async function computeRolesFromCookies(
  userCookie: string | null,
  activeRoleCookie: string | null,
): Promise<User | null> {
  const userBuffer = Buffer.from(userCookie ?? '', 'base64');
  const userStr = userBuffer.toString('utf-8');

  try {
    const baseUser: BaseUser = JSON.parse(userStr);
    return computeRolesFromJWT(baseUser, activeRoleCookie);
  } catch {
    return null;
  }
}
