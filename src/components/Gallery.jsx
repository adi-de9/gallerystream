import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import ImageModal from './ImageModal';
import ImageCard from './ImageCard';
import { Grid, List, Loader2Icon } from 'lucide-react';
import { useInfiniteImages } from '../hooks/useInfiniteImages';

const Gallery = ({ searchQuery }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteImages();

  // Fetch next page when user scrolls to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten paginated images
  const images = useMemo(() => {
    return data?.pages.flatMap(page => page) || [];
  }, [data]);

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery) return images;
    
    const query = searchQuery.toLowerCase();
    return images.filter(img => 
      img.user.name.toLowerCase().includes(query) ||
      (img.alt_description && img.alt_description.toLowerCase().includes(query))
    );
  }, [images, searchQuery]);

  // Memoized callbacks
  const handleImageClick = useCallback((img) => {
    setSelectedImage(img);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2Icon className="animate-spin rounded-full h-12 w-12 "/>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Error loading images</p>
          <p className="text-sm text-red-500 mt-1">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Recent Uploads</h2>
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Grid view"
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
          : 'flex flex-col gap-4'
      }>
        {filteredImages.map((img,index) => (
          <ImageCard 
            key={img.id + index} 
            image={img} 
            viewMode={viewMode}
            onClick={handleImageClick}
          />
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div ref={ref} className="mt-8 flex items-center justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}

      {selectedImage && (
        <ImageModal image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Gallery;
