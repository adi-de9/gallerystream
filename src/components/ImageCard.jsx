import React, { useMemo, useCallback } from 'react';
import { useImageInteractions } from '../hooks/useImageInteractions';
import {  MessageCircle } from 'lucide-react';

const ImageCard = ({ image, viewMode, onClick, isHighlighted }) => {
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

  const highlightClass = isHighlighted 
    ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-lg scale-[1.02] z-10' 
    : 'border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.005]';

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleClick}
        className={`bg-white rounded-xl border p-4 flex gap-4 transition-all duration-300 cursor-pointer ${highlightClass}`}
      >
        <div className="w-28 h-28 overflow-hidden rounded-lg shrink-0 relative group/img bg-gray-100">
          <img 
            src={image.urls.small} 
            alt={image.alt_description} 
            className="w-full h-full object-cover transition-transform duration-400 group-hover/img:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 truncate text-base">{image.alt_description || 'Untitled'}</h3>
            <p className="text-xs text-gray-600 font-medium mt-1">@{image.user.name.toLowerCase().replace(/\s+/g, '_')}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {reactionStats.topEmojis.slice(0, 3).map(([emoji, count]) => (
              <div key={emoji} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
                <span className="text-base leading-none">{emoji}</span>
                <span className="text-xs font-semibold text-gray-700">{count}</span>
              </div>
            ))}
            {comments.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-gray-600 bg-gray-50">
                <MessageCircle size={14} strokeWidth={2.5} />
                <span className="text-xs font-semibold">{comments.length}</span>
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
      className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer group ${
        isHighlighted 
          ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-lg scale-[1.02] z-10' 
          : 'border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.01]'
      }`}
    >
      {/* Image */}
      <div className="aspect-3/4 relative overflow-hidden bg-gray-100">
        <img 
          src={image.urls.small} 
          alt={image.alt_description} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/3 transition-colors duration-300" />
      </div>

      {/* Metadata */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate text-base">
          {image.alt_description || 'Untitled'}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{timeAgo}</p>
          <span className="text-gray-300">•</span>
          <p className="text-xs text-gray-600 font-medium">@{image.user.name.toLowerCase().replace(/\s+/g, '_')}</p>
        </div>

        {/* Inline Reactions */}
        <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-gray-100">
          {reactionStats.topEmojis.map(([emoji, count]) => (
            <div key={emoji} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full transition-all duration-200 hover:bg-gray-100 hover:scale-105">
              <span className="text-lg leading-none">{emoji}</span>
              <span className="text-sm font-semibold text-gray-700">{count}</span>
            </div>
          ))}

          {comments.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-600 ml-auto px-2 py-1 rounded-full transition-all duration-200 hover:bg-gray-50">
              <MessageCircle size={15} strokeWidth={2.5} />
              <span className="text-sm font-semibold">{comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageCard);
