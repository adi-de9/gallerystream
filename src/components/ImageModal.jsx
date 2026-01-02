import React, { useState, useMemo, useCallback } from 'react';
import { X, Send, Smile } from 'lucide-react';
import { useImageInteractions } from '../hooks/useImageInteractions';

const EMOJIS = ['❤️', '🔥', '👏', '😂', '😮', '😢'];

const ImageModal = ({ image, onClose }) => {
  const { reactions, comments, addReaction, addComment } = useImageInteractions(image.id);
  const [commentText, setCommentText] = useState('');

  // Controlled input handler
  const handleCommentChange = useCallback((e) => {
    setCommentText(e.target.value);
  }, []);

  const handleSubmitComment = useCallback((e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(commentText.trim(), image.urls.thumb);
      setCommentText(''); // Reset controlled input
    }
  }, [commentText, addComment, image.urls.thumb]);

  const handleReactionClick = useCallback((emoji) => {
    addReaction(emoji, image.urls.thumb);
  }, [addReaction, image.urls.thumb]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoize reaction counts
  const reactionCounts = useMemo(() => {
    return reactions.reduce((acc, curr) => {
      acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
      return acc;
    }, {});
  }, [reactions]);

  // Memoize sorted comments
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => b.createdAt - a.createdAt);
  }, [comments]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <button 
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        aria-label="Close modal"
      >
        <X size={24} />
      </button>

      <div className="bg-gray-900 w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-800">
        
        {/* Image Section */}
        <div className="flex-1 bg-black flex items-center justify-center relative group">
          <img 
            src={image.urls.regular} 
            alt={image.alt_description} 
            className="max-h-full max-w-full object-contain" 
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
            <h3 className="text-white text-lg font-medium">{image.user.name}</h3>
            {image.description && <p className="text-gray-300 text-sm mt-1 max-w-lg truncate">{image.description}</p>}
          </div>
        </div>

        {/* Interaction Section */}
        <div className="w-full md:w-[400px] flex flex-col bg-gray-900 border-l border-gray-800">
          
          {/* Reaction Header */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Smile size={18} className="text-yellow-500" /> Reactions
            </h3>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-lg transition-transform active:scale-95 flex items-center gap-2 border border-gray-700"
                  aria-label={`React with ${emoji}`}
                >
                  <span>{emoji}</span>
                  {reactionCounts[emoji] > 0 && (
                     <span className="text-xs font-bold text-gray-400">{reactionCounts[emoji]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
            {sortedComments.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No comments yet. Be the first!</div>
            ) : (
                sortedComments.map((comment) => (
                <div key={comment.id} className="group animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed bg-gray-800/50 p-3 rounded-lg rounded-tl-none">{comment.text}</p>
                </div>
                ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <form onSubmit={handleSubmitComment} className="relative">
              <input
                type="text"
                value={commentText}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                className="w-full bg-gray-800 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500 border border-gray-700"
                aria-label="Comment input"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors"
                aria-label="Submit comment"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageModal);
