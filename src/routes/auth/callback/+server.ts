import { base } from '$app/paths';
import { env as privateEnv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import { computeRolesFromJWT } from '../../../utilities/auth';
import type { BaseUser } from '../../../types/app';

export const GET: RequestHandler = async ({ cookies, url }) => {
  const code = url.searchParams.get('code');
  const verifier = cookies.get('pkceVerifier');

  if (!code || !verifier) {
    return new Response('Invalid OAuth response', { status: 400 });
  }

  const tokenResp = await fetch(`${env.PUBLIC_IDENTITY_PROVIDER_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.PUBLIC_OIDC_CLIENT_ID ?? 'aerie-ui',
      code,
      redirect_uri: `${privateEnv.ORIGIN}${base}/auth/callback`,
      code_verifier: verifier,
    }),
  });

  if (!tokenResp.ok) {
    return new Response('Authentication failed', { status: 401 });
  }

  const data = await tokenResp.json();
  const token: string | undefined = data.id_token || data.access_token;
  const userId = data.user_id ?? '';

  if (!token) {
    return new Response('Authentication failed', { status: 401 });
  }

  const baseUser: BaseUser = { id: userId, token };
  const roles = await computeRolesFromJWT(baseUser, null);

  if (!roles) {
    return new Response('Unauthorized', { status: 403 });
  }

  const userStr = JSON.stringify(baseUser);
  const userCookie = Buffer.from(userStr).toString('base64');
  const cookieOpts: CookieSerializeOptions & { path: string } = {
    httpOnly: false,
    path: `${base}/`,
    sameSite: 'none',
  };

  cookies.set('user', userCookie, cookieOpts);
  cookies.set('activeRole', roles.defaultRole, cookieOpts);
  cookies.delete('pkceVerifier', { path: `${base}/` });

  throw redirect(302, `${base}/plans`);
};
