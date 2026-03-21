import { Hono } from 'hono';

import type { ResumeData } from '../../src/entities/resume/model/types';
import { authenticate } from './middleware/authenticate';
import errorHandle from './middleware/errorHandle';
import { login, signUp } from './service/authService';
import { getResumeDraft, listResumeDrafts, saveResumeDraft } from './service/resumeDraftService';
import type { Bindings, Variables } from './types';

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

app.use('/api/*', errorHandle);
app.use('/api/auth/session', authenticate);
app.use('/api/resume-drafts*', authenticate);

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
  return ctx.json({
    result: true,
    user: ctx.get('authUser'),
  });
});

app.get('/api/resume-drafts', async (ctx) => {
  const authUser = ctx.get('authUser');
  const drafts = await listResumeDrafts(ctx, authUser);

  return ctx.json({
    result: true,
    drafts,
  });
});

app.get('/api/resume-drafts/:draftId', async (ctx) => {
  const authUser = ctx.get('authUser');
  const draftId = ctx.req.param('draftId');
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
  const authUser = ctx.get('authUser');
  const body = await ctx.req.json().catch(() => null);
  const data = body && 'data' in body ? (body.data as ResumeData) : null;

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
  const authUser = ctx.get('authUser');
  const draftId = ctx.req.param('draftId');
  const body = await ctx.req.json().catch(() => null);
  const data = body && 'data' in body ? (body.data as ResumeData) : null;

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

export default app;
