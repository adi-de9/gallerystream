import { db } from '../lib/instantdb';

// Add pagination and infinite scroll
export const useFeedInteractions = () => {
  const { isLoading, error, data } = db.useQuery({
    reactions: {
        $: {
            limit: 30, 
            order: { serverCreatedAt: 'desc' }
        }
    },
    comments: {
        $: {
            limit: 30,
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
