export interface MicroCMSListOptions {
  draftKey?: string;
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  fields?: string;
  ids?: string;
  filters?: string;
  depth?: 1 | 2 | 3;
}

export interface MicroCMSGetOptions {
  draftKey?: string;
  fields?: string;
  depth?: 1 | 2 | 3;
}

export interface MicroCMSCreateOptions {
  isDraft?: boolean;
  contentId?: string;
}

export interface MicroCMSUpdateOptions {
  isDraft?: boolean;
}

export interface MicroCMSContent {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
  [key: string]: any;
}

export interface MicroCMSListResponse<T = MicroCMSContent> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface MicroCMSErrorResponse {
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface MemberInfo {
  id: string;
  name: string;
  email: string;
  mfa: boolean;
}

export interface ToolParameters {
  endpoint: string;
  contentId?: string;
  content?: Record<string, any>;
  draftKey?: string;
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  fields?: string;
  ids?: string;
  filters?: string;
  depth?: 1 | 2 | 3;
  isDraft?: boolean;
  // Media parameters
  imageOnly?: boolean;
  fileName?: string;
  token?: string;
  fileData?: string;
  mimeType?: string;
  // Member parameters
  memberId?: string;
  // Status parameters
  status?: 'PUBLISH' | 'DRAFT';
  // CreatedBy parameters
  createdBy?: string;
}

export interface MediaToolParameters {
  limit?: number;
  imageOnly?: boolean;
  fileName?: string;
  token?: string;
  fileData?: string;
  mimeType?: string;
  externalUrl?: string;
  url?: string;
}