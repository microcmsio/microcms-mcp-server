// Service configuration types
export interface ServiceConfig {
  id: string; // サービスID (serviceDomain)
  apiKey: string; // APIキー
}

export type ConfigMode = 'single' | 'multi';

export interface SingleServiceConfig {
  mode: 'single';
  serviceDomain: string;
  apiKey: string;
}

export interface MultiServiceConfig {
  mode: 'multi';
  services: ServiceConfig[];
}

export type AppConfig = SingleServiceConfig | MultiServiceConfig;

// microCMS API types
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
  [key: string]: unknown;
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
  content?: Record<string, unknown>;
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

// Management API types
export interface ApiInfo {
  apiName: string;
  apiEndpoint: string;
  apiType: string[];
  apiFields: unknown[];
  customFields?: unknown[];
}

export interface ApiListResponse {
  apis: ApiInfo[];
}

export interface ContentMeta {
  id: string;
  status: string[];
  createdBy?: string;
  updatedBy?: string;
  reservationTime?: string | null;
  closedAt?: string | null;
  customStatus?: unknown;
  [key: string]: unknown;
}

export interface ContentMetaListResponse {
  contents: ContentMeta[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface MediaItem {
  url: string;
  width?: number;
  height?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface MediaListResponse {
  media: MediaItem[];
  token?: string;
}

export interface MediaUploadResponse {
  url: string;
}
