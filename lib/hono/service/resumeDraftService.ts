import type { ResumeData } from '../../../src/entities/resume/model/types';
import { decryptResumeData, encryptResumeData } from '../utils/crypto';
import type {
  AuthUser,
  Bindings,
  ResumeDraftRecord,
  ResumeDraftResult,
  ResumeDraftSummary,
} from '../types';

interface ServiceContext {
  env: Bindings;
}

const RESUME_DRAFTS_TABLE = 'user_resume_drafts';

const readDraft = async (
  env: Bindings,
  userId: string,
  draftId: string,
): Promise<ResumeDraftRecord | null> => {
  const result = await env.RESUME_DB.prepare(
    `
      SELECT id, user_id, encrypted_payload, payload_iv, created_at, updated_at
      FROM ${RESUME_DRAFTS_TABLE}
      WHERE id = ?1 AND user_id = ?2
    `,
  )
    .bind(draftId, userId)
    .first<ResumeDraftRecord>();

  return result ?? null;
};

const readDraftOwnership = async (
  env: Bindings,
  draftId: string,
): Promise<Pick<ResumeDraftRecord, 'id' | 'user_id'> | null> => {
  const result = await env.RESUME_DB.prepare(
    `SELECT id, user_id FROM ${RESUME_DRAFTS_TABLE} WHERE id = ?1`,
  )
    .bind(draftId)
    .first<Pick<ResumeDraftRecord, 'id' | 'user_id'>>();

  return result ?? null;
};

const resolveDraftName = (data: ResumeData): string => {
  const fallbackName = data.name.trim() || data.headline.trim();

  return fallbackName || '未命名简历';
};

export const listResumeDrafts = async (
  ctx: ServiceContext,
  user: AuthUser,
): Promise<ResumeDraftSummary[]> => {
  const records = await ctx.env.RESUME_DB.prepare(
    `
      SELECT id, user_id, encrypted_payload, payload_iv, created_at, updated_at
      FROM ${RESUME_DRAFTS_TABLE}
      WHERE user_id = ?1
      ORDER BY updated_at DESC
    `,
  )
    .bind(user.id)
    .all<ResumeDraftRecord>();

  const rows = records.results ?? [];

  return Promise.all(
    rows.map(async (record) => {
      const data = await decryptResumeData(
        ctx.env.RESUME_ENCRYPTION_SECRET,
        user.id,
        record.encrypted_payload,
        record.payload_iv,
      );

      return {
        draftId: record.id,
        name: resolveDraftName(data),
        updatedAt: record.updated_at,
      };
    }),
  );
};

export const getResumeDraft = async (
  ctx: ServiceContext,
  user: AuthUser,
  draftId: string,
): Promise<ResumeDraftResult | null> => {
  const record = await readDraft(ctx.env, user.id, draftId);

  if (!record) {
    return null;
  }

  const data = await decryptResumeData(
    ctx.env.RESUME_ENCRYPTION_SECRET,
    user.id,
    record.encrypted_payload,
    record.payload_iv,
  );

  return {
    draftId: record.id,
    updatedAt: record.updated_at,
    data,
  };
};

export const saveResumeDraft = async (
  ctx: ServiceContext,
  user: AuthUser,
  draftId: string,
  data: ResumeData,
): Promise<ResumeDraftResult | 'forbidden'> => {
  const ownership = await readDraftOwnership(ctx.env, draftId);

  if (ownership && ownership.user_id !== user.id) {
    return 'forbidden';
  }

  const now = Date.now();
  const encryptedPayload = await encryptResumeData(ctx.env.RESUME_ENCRYPTION_SECRET, user.id, data);

  await ctx.env.RESUME_DB.prepare(
    `
      INSERT INTO ${RESUME_DRAFTS_TABLE} (id, user_id, encrypted_payload, payload_iv, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?5)
      ON CONFLICT(id) DO UPDATE SET
        encrypted_payload = excluded.encrypted_payload,
        payload_iv = excluded.payload_iv,
        updated_at = excluded.updated_at
    `,
  )
    .bind(draftId, user.id, encryptedPayload.encryptedPayload, encryptedPayload.payloadIv, now)
    .run();

  return {
    draftId,
    updatedAt: now,
    data,
  };
};
