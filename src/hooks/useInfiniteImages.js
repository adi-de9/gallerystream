import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchImages } from '../lib/unsplash';

export const useInfiniteImages = () => {
  return useInfiniteQuery({
    queryKey: ['images'],
    queryFn: ({ pageParam = 1 }) => fetchImages(pageParam, 8),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};
