import { describe, it, expect } from 'vitest';
import { getSortedPosts, type BlogEntry } from './blog';

function makePost(overrides: Partial<BlogEntry['data']> & { id: string }): BlogEntry {
  const { id, ...data } = overrides;
  return {
    id,
    data: {
      title: 'Untitled',
      description: '',
      pubDate: new Date('2026-01-01'),
      draft: false,
      ...data,
    },
  };
}

describe('getSortedPosts', () => {
  it('sorts posts by pubDate descending', () => {
    const older = makePost({ id: 'older', pubDate: new Date('2026-01-01') });
    const newer = makePost({ id: 'newer', pubDate: new Date('2026-06-01') });

    const result = getSortedPosts([older, newer]);

    expect(result.map((p) => p.id)).toEqual(['newer', 'older']);
  });

  it('excludes draft posts', () => {
    const published = makePost({ id: 'published', draft: false });
    const draft = makePost({ id: 'draft', draft: true });

    const result = getSortedPosts([published, draft]);

    expect(result.map((p) => p.id)).toEqual(['published']);
  });
});
