// Content Studio = ONE canonical content model repurposed across channels
// (Naver Blog / Instagram / YouTube / Video / generic). Channel-specific
// generation and publishing build on this in later sprints. Admin-managed.

export type ContentStatus =
  | 'draft'
  | 'generating'
  | 'ready'
  | 'publish_pending'
  | 'published'
  | 'failed'
  | 'cancelled';

export type ContentChannel =
  | 'generic'
  | 'naver_blog'
  | 'instagram'
  | 'youtube'
  | 'video';

export type ContentSourceType = 'operator' | 'famous' | 'topic';

export type ContentListItem = {
  id: string;
  title: string;
  channel: ContentChannel;
  status: ContentStatus;
  sourceType: ContentSourceType;
  famousId: string | null;
  updatedAt: string | null;
};

export type ContentItem = {
  id: string;
  title: string;
  channel: ContentChannel;
  sourceType: ContentSourceType;
  famousId: string | null;
  status: ContentStatus;
  body: string | null;
  summary: string | null;
  tags: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

// Editor-writable fields. Status transitions available to the operator are a
// subset (draft/ready/cancelled); generating/publish_pending/published/failed
// are set by system flows (CONTENT-02 generation, CONTENT-07 publishing).
export type ContentInput = {
  title: string;
  channel: ContentChannel;
  sourceType: ContentSourceType;
  famousId: string | null;
  status: ContentStatus;
  body: string | null;
  summary: string | null;
  tags: string[];
};

export type ContentListParams = {
  search?: string;
  channel?: ContentChannel | null;
  limit: number;
  offset: number;
};
