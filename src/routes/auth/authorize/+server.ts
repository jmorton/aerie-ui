import { base } from '$app/paths';
import { env as privateEnv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import { generateCodeVerifier, generateCodeChallenge } from '../../../utilities/auth';

export const GET: RequestHandler = async ({ cookies }) => {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const cookieOpts: CookieSerializeOptions & { path: string } = {
    httpOnly: true,
    path: `${base}/`,
    sameSite: 'lax',
  };

  cookies.set('pkceVerifier', verifier, cookieOpts);

  const redirectUri = `${privateEnv.ORIGIN}${base}/auth/callback`;
  const authorizationEndpoint = `${env.PUBLIC_IDENTITY_PROVIDER_URL}/authorize`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.PUBLIC_OIDC_CLIENT_ID ?? 'aerie-ui',
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    scope: 'openid',
  });

  throw redirect(302, `${authorizationEndpoint}?${params.toString()}`);
};
