import type { ResumeData } from '@/entities/resume/model/types';
import type { CloudDraftSummary } from '@/entities/auth/model/types';

import { requestJson } from './http';

interface ResumeDraftResponse {
  result: true;
  draftId: string;
  updatedAt: number;
  data: ResumeData;
}

interface ResumeDraftListResponse {
  result: true;
  drafts: CloudDraftSummary[];
}

export const loadCloudResumeDraft = async (draftId: string): Promise<ResumeDraftResponse> => {
  return requestJson<ResumeDraftResponse>(
    `/api/resume-drafts/${encodeURIComponent(draftId)}`,
    undefined,
    {
      auth: true,
    },
  );
};

export const saveCloudResumeDraft = async (
  data: ResumeData,
  draftId: string | null,
): Promise<ResumeDraftResponse> => {
  const method = draftId ? 'PUT' : 'POST';
  const endpoint = draftId
    ? `/api/resume-drafts/${encodeURIComponent(draftId)}`
    : '/api/resume-drafts';

  return requestJson<ResumeDraftResponse>(endpoint, {
    method,
    body: JSON.stringify({ data }),
  }, {
    auth: true,
  });
};

export const listCloudResumeDrafts = async (): Promise<CloudDraftSummary[]> => {
  const response = await requestJson<ResumeDraftListResponse>('/api/resume-drafts', undefined, {
    auth: true,
  });

  return response.drafts;
};
