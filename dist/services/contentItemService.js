// services/contentItemService.ts
export function processContentItems(contentItems) {
    return contentItems.map(item => processContentItem(item));
}
function processContentItem(item) {
    if (item.type === 'video') {
        return {
            ...item,
            data: generateVideoUrl(item.data)
        };
    }
    return item;
}
function generateVideoUrl(originalUrl) {
    const parts = originalUrl.split('\\');
    const [courseId, sectionId, filename] = parts.slice(-3);
    return `/api/media/${courseId}/${sectionId}/${filename}`;
}
