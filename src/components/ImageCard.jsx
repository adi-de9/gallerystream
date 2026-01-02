import React, { useMemo, useCallback } from 'react';
import { useImageInteractions } from '../hooks/useImageInteractions';
import { Heart, MessageCircle } from 'lucide-react';

const ImageCard = ({ image, viewMode, onClick }) => {
  const { reactions, comments } = useImageInteractions(image.id);

  // Memoize reaction calculations
  const reactionStats = useMemo(() => {
    const totalReactions = reactions.length;
    const emojiCounts = reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    const topEmojis = Object.entries(emojiCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { totalReactions, topEmojis };
  }, [reactions]);

  const handleClick = useCallback(() => {
    onClick(image);
  }, [onClick, image]);

  const timeAgo = '2h ago'; // Mock time

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleClick}
        className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <img 
          src={image.urls.small} 
          alt={image.alt_description} 
          className="w-32 h-32 object-cover rounded-lg shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{image.alt_description || 'Untitled'}</h3>
          <p className="text-sm text-gray-500 mt-1">@{image.user.name.toLowerCase().replace(/\s+/g, '_')}</p>
          <div className="flex items-center gap-4 mt-3">
            {reactionStats.totalReactions > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Heart size={16} />
                <span className="text-sm">{reactionStats.totalReactions}</span>
              </div>
            )}
            {comments.length > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <MessageCircle size={16} />
                <span className="text-sm">{comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
        <img 
          src={image.urls.small} 
          alt={image.alt_description} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Metadata */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">
          {image.alt_description || 'Untitled'}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">{timeAgo}</p>
        <p className="text-sm text-gray-600 mt-1">@{image.user.name.toLowerCase().replace(/\s+/g, '_')}</p>

        {/* Inline Reactions */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          {reactionStats.totalReactions > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Heart size={16} className="text-red-500" fill="currentColor" />
              <span className="text-sm font-medium">{reactionStats.totalReactions}</span>
            </div>
          )}
          
          {reactionStats.topEmojis.map(([emoji, count]) => (
            <div key={emoji} className="flex items-center gap-1">
              <span className="text-base">{emoji}</span>
              <span className="text-sm text-gray-600">{count}</span>
            </div>
          ))}

          {comments.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700 ml-auto">
              <MessageCircle size={16} />
              <span className="text-sm font-medium">{comments.length}</span>
            </div>
          )}

          {reactionStats.totalReactions === 0 && comments.length === 0 && (
            <p className="text-xs text-gray-400 italic">No reactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageCard);
