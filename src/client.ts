import { createClient, createManagementClient, MicroCMSQueries } from 'microcms-js-sdk';
import type { MicroCMSContent, MicroCMSListResponse } from './types.js';
import { parseConfig } from './config.js';

const config = parseConfig();

export const microCMSClient = createClient({
  serviceDomain: config.serviceDomain,
  apiKey: config.apiKey,
});

export const microCMSManagementClient = createManagementClient({
  serviceDomain: config.serviceDomain,
  apiKey: config.apiKey,
});

export const microCMSConfig = {
  serviceDomain: config.serviceDomain,
  apiKey: config.apiKey,
};

export async function getList<T = MicroCMSContent>(
  endpoint: string,
  queries?: MicroCMSQueries
): Promise<MicroCMSListResponse<T>> {
  return await microCMSClient.getList<T>({
    endpoint,
    queries,
  });
}

export async function getListDetail<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  queries?: MicroCMSQueries
): Promise<T> {
  return await microCMSClient.getListDetail<T>({
    endpoint,
    contentId,
    queries,
  });
}

export async function create<T = MicroCMSContent>(
  endpoint: string,
  content: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>,
  options?: { isDraft?: boolean; contentId?: string }
): Promise<{ id: string }> {
  return await microCMSClient.create({
    endpoint,
    content,
    ...options,
  });
}

export async function update<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  content: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>,
  options?: { isDraft?: boolean }
): Promise<{ id: string }> {
  return await microCMSClient.update({
    endpoint,
    contentId,
    content,
    ...options,
  });
}

export async function patch<T = MicroCMSContent>(
  endpoint: string,
  contentId: string,
  content: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'revisedAt'>>,
  options?: { isDraft?: boolean }
): Promise<{ id: string }> {
  return await microCMSClient.update({
    endpoint,
    contentId,
    content,
    ...options,
  });
}

export async function deleteContent(
  endpoint: string,
  contentId: string
): Promise<void> {
  return await microCMSClient.delete({
    endpoint,
    contentId,
  });
}

export async function getApiInfo(endpoint: string): Promise<any> {
  const url = `https://${config.serviceDomain}.microcms-management.io/api/v1/apis/${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get API info: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}