export interface BlogEntry {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    draft: boolean;
  };
}

export function getSortedPosts<T extends BlogEntry>(entries: T[]): T[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
