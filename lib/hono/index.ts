import { Hono } from 'hono';
import type { Context } from 'hono';

import type { ResumeData } from '../../src/entities/resume/model/types';
import { authenticate } from './middleware/authenticate';
import errorHandle from './middleware/errorHandle';
import { changePassword, getProfile, login, signUp, updateProfile } from './service/authService';
import {
  deleteResumeDraft,
  getResumeDraft,
  listResumeDrafts,
  saveResumeDraft,
} from './service/resumeDraftService';
import type { AuthIdentity, Bindings, Variables } from './types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const isResumePayload = (value: unknown): value is ResumeData => {
  return typeof value === 'object' && value !== null && Array.isArray((value as ResumeData).items);
};

const isEmailValid = (value: string): boolean => {
  return /\S+@\S+\.\S+/.test(value.trim());
};

const isPasswordValid = (value: string): boolean => {
  return value.trim().length >= 8;
};

const getAuthUser = (
  ctx: Context<{ Bindings: Bindings; Variables: Variables }>,
): AuthIdentity | null => {
  const authUser = ctx.get('authUser');

  if (!authUser?.id || !authUser.email) {
    return null;
  }

  return authUser;
};

app.use('/api/*', errorHandle);
app.use('/api/auth/session', authenticate);
app.use('/api/auth/profile', authenticate);
app.use('/api/auth/change-password', authenticate);
app.use('/api/resume-drafts', authenticate);
app.use('/api/resume-drafts/*', authenticate);

app.get('/api/health', (ctx) => {
  return ctx.json({
    result: true,
    message: 'ok',
  });
});

app.post('/api/auth/signup', async (ctx) => {
  const body = await ctx.req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!isEmailValid(email) || !isPasswordValid(password)) {
    return ctx.json(
      {
        result: false,
        message: '请输入有效邮箱，密码至少 8 位。',
      },
      400,
    );
  }

  const authResult = await signUp(ctx, email, password);

  if (authResult === 'email-exists') {
    return ctx.json(
      {
        result: false,
        message: '该邮箱已注册，请直接登录。',
      },
      409,
    );
  }

  return ctx.json({
    result: true,
    ...authResult,
  });
});

app.post('/api/auth/login', async (ctx) => {
  const body = await ctx.req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!isEmailValid(email) || !password.trim()) {
    return ctx.json(
      {
        result: false,
        message: '请输入正确的邮箱和密码。',
      },
      400,
    );
  }

  const authResult = await login(ctx, email, password);

  if (!authResult) {
    return ctx.json(
      {
        result: false,
        message: '邮箱或密码不正确。',
      },
      401,
    );
  }

  return ctx.json({
    result: true,
    ...authResult,
  });
});

app.get('/api/auth/session', async (ctx) => {
  const authUser = getAuthUser(ctx);

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  const profile = await getProfile(ctx, authUser.id);

  if (!profile) {
    return ctx.json(
      {
        result: false,
        message: 'User not found.',
      },
      404,
    );
  }

  return ctx.json({
    result: true,
    user: profile,
  });
});

app.put('/api/auth/profile', async (ctx) => {
  const authUser = getAuthUser(ctx);
  const body = await ctx.req.json().catch(() => null);
  const displayName = typeof body?.displayName === 'string' ? body.displayName : '';

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  if (!displayName.trim()) {
    return ctx.json(
      {
        result: false,
        message: '请输入显示名称。',
      },
      400,
    );
  }

  const profile = await updateProfile(ctx, authUser.id, displayName);

  if (!profile) {
    return ctx.json(
      {
        result: false,
        message: 'User not found.',
      },
      404,
    );
  }

  return ctx.json({
    result: true,
    user: profile,
  });
});

app.post('/api/auth/change-password', async (ctx) => {
  const authUser = getAuthUser(ctx);
  const body = await ctx.req.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const nextPassword = typeof body?.nextPassword === 'string' ? body.nextPassword : '';

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  if (!currentPassword.trim() || !isPasswordValid(nextPassword)) {
    return ctx.json(
      {
        result: false,
        message: '请输入当前密码，新密码至少 8 位。',
      },
      400,
    );
  }

  const result = await changePassword(ctx, authUser.id, currentPassword, nextPassword);

  if (result === 'user-not-found') {
    return ctx.json(
      {
        result: false,
        message: 'User not found.',
      },
      404,
    );
  }

  if (result === 'invalid-password') {
    return ctx.json(
      {
        result: false,
        message: '当前密码不正确。',
      },
      400,
    );
  }

  return ctx.json({
    result: true,
  });
});

app.get('/api/resume-drafts', async (ctx) => {
  const authUser = getAuthUser(ctx);

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  const drafts = await listResumeDrafts(ctx, authUser);

  return ctx.json({
    result: true,
    drafts,
  });
});

app.get('/api/resume-drafts/:draftId', async (ctx) => {
  const authUser = getAuthUser(ctx);
  const draftId = ctx.req.param('draftId');

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  const draft = await getResumeDraft(ctx, authUser, draftId);

  if (!draft) {
    return ctx.json(
      {
        result: false,
        message: 'Resume draft not found.',
      },
      404,
    );
  }

  return ctx.json({
    result: true,
    ...draft,
  });
});

app.post('/api/resume-drafts', async (ctx) => {
  const authUser = getAuthUser(ctx);
  const body = await ctx.req.json().catch(() => null);
  const data = body && 'data' in body ? (body.data as ResumeData) : null;

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  if (!isResumePayload(data)) {
    return ctx.json(
      {
        result: false,
        message: 'Invalid resume payload.',
      },
      400,
    );
  }

  const draft = await saveResumeDraft(ctx, authUser, crypto.randomUUID(), data);

  if (draft === 'forbidden') {
    return ctx.json(
      {
        result: false,
        message: '你没有权限创建这份草稿。',
      },
      403,
    );
  }

  return ctx.json({
    result: true,
    ...draft,
  });
});

app.put('/api/resume-drafts/:draftId', async (ctx) => {
  const authUser = getAuthUser(ctx);
  const draftId = ctx.req.param('draftId');
  const body = await ctx.req.json().catch(() => null);
  const data = body && 'data' in body ? (body.data as ResumeData) : null;

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  if (!isResumePayload(data)) {
    return ctx.json(
      {
        result: false,
        message: 'Invalid resume payload.',
      },
      400,
    );
  }

  const draft = await saveResumeDraft(ctx, authUser, draftId, data);

  if (draft === 'forbidden') {
    return ctx.json(
      {
        result: false,
        message: '你没有权限修改这份草稿。',
      },
      403,
    );
  }

  return ctx.json({
    result: true,
    ...draft,
  });
});

app.delete('/api/resume-drafts/:draftId', async (ctx) => {
  const authUser = getAuthUser(ctx);
  const draftId = ctx.req.param('draftId');

  if (!authUser) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  const result = await deleteResumeDraft(ctx, authUser, draftId);

  if (result === 'not-found') {
    return ctx.json(
      {
        result: false,
        message: 'Resume draft not found.',
      },
      404,
    );
  }

  if (result === 'forbidden') {
    return ctx.json(
      {
        result: false,
        message: '你没有权限删除这份草稿。',
      },
      403,
    );
  }

  return ctx.json({
    result: true,
    draftId,
  });
});

export default app;
