import { dev } from '$app/environment';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import type { ChangeUserRoleRequestBody } from '../../../types/auth';

export const POST: RequestHandler = async event => {
  const body: ChangeUserRoleRequestBody = await event.request.json();
  const { role } = body;
  event.cookies.set('activeRole', role, { httpOnly: false, path: '/', secure: !dev });

  return json({ success: true });
};
