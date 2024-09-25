// services/contentItemService.ts

import { ContentItem } from '../types/models.js';

export function processContentItems(contentItems: ContentItem[]): ContentItem[] {
  return contentItems.map(item => processContentItem(item));
}

function processContentItem(item: ContentItem): ContentItem {
  if (item.type === 'video') {
    return {
      ...item,
      data: generateVideoUrl(item.data)
    };
  }
  return item;
}

function generateVideoUrl(originalUrl: string): string {
  const parts = originalUrl.split('\\');
  const [courseId, sectionId, filename] = parts.slice(-3);
  return `/api/media/${courseId}/${sectionId}/${filename}`;
}