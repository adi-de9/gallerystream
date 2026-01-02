import { db } from '../lib/instantdb';

export const useFeedInteractions = () => {
  const { isLoading, error, data } = db.useQuery({
    reactions: {
        $: {
            limit: 30, 
            order: { serverCreatedAt: 'desc' } // Note: InstantDB often uses serverCreatedAt or we use client 'createdAt'
            // For now, assume we sort client-side if server sorting is complex in free tier or specific version. 
            // InstantDB usually supports logic in query. Let's try simple query first.
        }
    },
    comments: {
        $: {
            limit: 30,
            // order: { serverCreatedAt: 'desc' }
        }
    },
  });

  const allItems = [
    ...(data?.reactions || []).map(r => ({ ...r, type: 'reaction' })),
    ...(data?.comments || []).map(c => ({ ...c, type: 'comment' }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  return {
    isLoading,
    error,
    feedItems: allItems,
  };
};
