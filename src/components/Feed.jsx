import  { memo, useMemo } from 'react';
import { useFeedInteractions } from '../hooks/useFeedInteractions';
import { Heart } from 'lucide-react';

const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getUserColor = (userName) => {
  const bgColors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
    'from-red-400 to-red-600',
  ];
  const colorIndex = userName.charCodeAt(0) % bgColors.length;
  return bgColors[colorIndex];
};

const Feed = ({ setHighlightedImageId }) => {
  const { feedItems, isLoading } = useFeedInteractions();

  // Memoize empty state
  const isEmpty = useMemo(() => feedItems.length === 0, [feedItems.length]);
  console.log(feedItems);

  if (isLoading) {
    return (
      <div className="text-center py-10 px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading activity...</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart size={24} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No activity yet</p>
        <p className="text-xs text-gray-400 mt-1">Interact with images to see updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {feedItems.map((item, index) => {
        const initial = item.userName.charAt(0).toUpperCase();
        const bgColor = getUserColor(item.userName);
        // Check if item is recent (within last 10 seconds)
        const isNew = Date.now() - item.createdAt < 10000;

        return (
          <div 
            key={item.id} 
            className={`flex gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 animate-in fade-in slide-in-from-bottom-2 ${
              isNew ? 'bg-blue-50/30' : ''
            }`}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
              animationDuration: '400ms'
            }}
          >
            {/* User Avatar */}
            <div className={`w-9 h-9 rounded-full bg-linear-to-br ${bgColor} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
              {initial}
            </div>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed text-gray-700">
                    <span className="font-semibold text-gray-900">{item.userName}</span>
                    {item.type === 'reaction' ? (
                      <>
                        <span className="text-gray-600"> reacted </span>
                        <span className="text-xl inline-block align-middle">{item.emoji}</span>
                        <span className="text-gray-600"> to an image</span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-600"> commented: </span>
                        <span className="text-gray-700 italic">"{item.text.length > 45 ? item.text.slice(0, 45) + '...' : item.text}"</span>
                      </>
                    )}
                    <span className="text-gray-400"> · </span>
                    <span className="text-xs text-gray-500 font-medium">{getTimeAgo(item.createdAt)}</span>
                  </p>
                </div>

                {/* Thumbnail */}
                {item.imageUrl && (
                  <div 
                    className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-200 transition-transform duration-200 hover:scale-110 cursor-pointer"
                    onMouseEnter={() => setHighlightedImageId && setHighlightedImageId(item.imageId)}
                    onMouseLeave={() => setHighlightedImageId && setHighlightedImageId(null)}
                    onClick={() => setHighlightedImageId && setHighlightedImageId(item.imageId)}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt="Context" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(Feed);
