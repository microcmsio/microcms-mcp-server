import { MicroCMSQueries } from 'microcms-js-sdk';
import type { MicroCMSContent, MicroCMSListResponse } from './types.js';
export declare const microCMSClient: {
    get: <T = any>({ endpoint, contentId, queries, customRequestInit, }: import("microcms-js-sdk").GetRequest) => Promise<T>;
    getList: <T_1 = any>({ endpoint, queries, customRequestInit, }: import("microcms-js-sdk").GetListRequest) => Promise<import("microcms-js-sdk").MicroCMSListResponse<T_1>>;
    getListDetail: <T_2 = any>({ endpoint, contentId, queries, customRequestInit, }: import("microcms-js-sdk").GetListDetailRequest) => Promise<T_2 & import("microcms-js-sdk").MicroCMSContentId & import("microcms-js-sdk").MicroCMSDate>;
    getObject: <T_3 = any>({ endpoint, queries, customRequestInit, }: import("microcms-js-sdk").GetObjectRequest) => Promise<T_3 & import("microcms-js-sdk").MicroCMSDate>;
    getAllContentIds: ({ endpoint, alternateField, draftKey, filters, orders, customRequestInit, }: import("microcms-js-sdk").GetAllContentIdsRequest) => Promise<string[]>;
    getAllContents: <T_4 = any>({ endpoint, queries, customRequestInit, }: import("microcms-js-sdk").GetAllContentRequest) => Promise<(T_4 & import("microcms-js-sdk").MicroCMSContentId & import("microcms-js-sdk").MicroCMSDate)[]>;
    create: <T_5 extends Record<string | number, any>>({ endpoint, contentId, content, isDraft, customRequestInit, }: import("microcms-js-sdk").CreateRequest<T_5>) => Promise<import("microcms-js-sdk").WriteApiRequestResult>;
    update: <T_6 extends Record<string | number, any>>({ endpoint, contentId, content, customRequestInit, }: import("microcms-js-sdk").UpdateRequest<T_6>) => Promise<import("microcms-js-sdk").WriteApiRequestResult>;
    delete: ({ endpoint, contentId, customRequestInit, }: import("microcms-js-sdk").DeleteRequest) => Promise<void>;
};
export declare const microCMSManagementClient: {
    uploadMedia: ({ data, name, type, customRequestHeaders, }: import("microcms-js-sdk").UploadMediaRequest) => Promise<{
        url: string;
    }>;
};
export declare const microCMSConfig: {
    serviceDomain: string;
    apiKey: string;
};
export declare function getList<T = MicroCMSContent>(endpoint: string, queries?: MicroCMSQueries): Promise<MicroCMSListResponse<T>>;
export declare function getListDetail<T = MicroCMSContent>(endpoint: string, contentId: string, queries?: MicroCMSQueries): Promise<T>;
export declare function create<T = MicroCMSContent>(endpoint: string, content: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>, options?: {
    isDraft?: boolean;
    contentId?: string;
}): Promise<{
    id: string;
}>;
export declare function update<T = MicroCMSContent>(endpoint: string, contentId: string, content: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>, options?: {
    isDraft?: boolean;
}): Promise<{
    id: string;
}>;
export declare function patch<T = MicroCMSContent>(endpoint: string, contentId: string, content: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>>, options?: {
    isDraft?: boolean;
}): Promise<{
    id: string;
}>;
export declare function deleteContent(endpoint: string, contentId: string): Promise<void>;
//# sourceMappingURL=client.d.ts.map