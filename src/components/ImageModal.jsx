import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { X, Send, Smile, Plus, Trash2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useImageInteractions } from '../hooks/useImageInteractions';
import { useUserStore } from '../store/useUserStore';
import { EMOJIS } from '../utils/constants';

const ImageModal = ({ image, onClose }) => {
  const { reactions, comments, addReaction, addComment, deleteComment } = useImageInteractions(image.id);
  const { userId } = useUserStore();
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const modalContentRef = useRef(null);
  const commentInputRef = useRef(null);

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

  const handleEmojiClick = useCallback((emojiData) => {
    addReaction(emojiData.emoji, image.urls.thumb);
    setShowEmojiPicker(false);
  }, [addReaction, image.urls.thumb]);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

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

  // Get current user's reaction (WhatsApp-style: only one emoji per user)
  const userReaction = useMemo(() => {
    return reactions.find(r => r.userId === userId);
  }, [reactions, userId]);

  // Get all unique emojis that have been used (for displaying custom emoji reactions)
  const allUsedEmojis = useMemo(() => {
    const uniqueEmojis = new Set(reactions.map(r => r.emoji));
    return Array.from(uniqueEmojis);
  }, [reactions]);

  // Memoize sorted comments
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => b.createdAt - a.createdAt);
  }, [comments]);

  // Delete handlers (after memoized values to avoid initialization errors)
  const handleDeleteComment = useCallback((commentId) => {
    deleteComment(commentId);
  }, [deleteComment]);


  // Keyboard shortcuts (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEmojiPicker, handleClose]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        // Check if click is not on the toggle button
        const toggleButton = e.target.closest('button[aria-label="Open emoji picker"]');
        if (!toggleButton) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Auto-focus comment input on mount
  useEffect(() => {
    commentInputRef.current?.focus();
  }, []);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white rounded-full text-gray-700 transition-all duration-200 hover:scale-110 z-60 shadow-lg"
        aria-label="Close modal"
      >
        <X size={24} />
      </button>

      <div
        ref={modalContentRef}
        className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center relative group">
          <img
            src={image.urls.regular}
            alt={image.alt_description}
            className="max-h-full max-w-full object-contain transition-opacity duration-300"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white/95 via-white/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-gray-900 text-lg font-medium">
              {image.user.name}
            </h3>
            {image.description && (
              <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                {image.description}
              </p>
            )}
          </div>
        </div>

        {/* Interaction Section */}
        <div className="w-full md:w-[400px] flex flex-col bg-white border-l border-gray-200">
          {/* Reaction Header */}
          <div className="p-4 border-b border-gray-200 relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 font-medium flex items-center gap-2">
                <Smile size={18} className="text-yellow-500" /> Reactions
              </h3>
              {userReaction && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    You reacted with {userReaction.emoji}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Quick Reactions</p>

              <div className="flex flex-wrap gap-2 items-center">
                {EMOJIS.map((emoji) => {
                  const isUserReaction = userReaction?.emoji === emoji;
                  const count = reactionCounts[emoji] || 0;

                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(emoji)}
                      className={`px-3 py-1.5 rounded-full text-lg transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-2 border ${
                        isUserReaction
                          ? "bg-blue-600 border-blue-500 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/30 text-white"
                          : "bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-gray-400"
                      }`}
                      aria-label={`React with ${emoji}`}
                      title={
                        isUserReaction
                          ? "Click to remove your reaction"
                          : `React with ${emoji}`
                      }
                    >
                      <span>{emoji}</span>
                      {count > 0 && (
                        <span
                          className={`text-xs font-bold ${
                            isUserReaction ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Add Emoji Button  */}
                <button
                  onClick={toggleEmojiPicker}
                  className={`px-3 py-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center border ${
                    showEmojiPicker
                      ? "bg-blue-600 border-blue-500 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700"
                  }`}
                  aria-label="Add more reactions"
                  title="Add more reactions"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute top-full left-4 mt-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-300 animate-in slide-in-from-top-4 duration-200"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="light"
                  width={320}
                  height={400}
                  searchPlaceholder="Search emojis..."
                  previewConfig={{ showPreview: true }}
                />
              </div>
            )}

            {/* All Reactions (including custom emojis from picker) */}
            {allUsedEmojis.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">
                  All Reactions ({allUsedEmojis.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {allUsedEmojis.map((emoji) => {
                    const isUserReaction = userReaction?.emoji === emoji;
                    const count = reactionCounts[emoji];
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReactionClick(emoji)}
                        className={`px-3 py-1.5 rounded-full text-lg transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-2 border ${
                          isUserReaction
                            ? "bg-blue-600 border-blue-500 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/30 text-white"
                            : "bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-gray-400"
                        }`}
                        aria-label={`React with ${emoji}`}
                        title={
                          isUserReaction
                            ? "Click to remove your reaction"
                            : `React with ${emoji}`
                        }
                      >
                        <span>{emoji}</span>
                        <span
                          className={`text-xs font-bold ${
                            isUserReaction ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {sortedComments.length === 0 ? (
              <div className="text-center text-gray-500 mt-10 flex flex-col items-center gap-2">
                <div className="text-4xl opacity-30">💬</div>
                <p className="text-sm">No comments yet. Be the first!</p>
              </div>
            ) : (
              sortedComments.map((comment) => {
                const isUserComment = comment.userId === userId;
                return (
                  <div
                    key={comment.id}
                    className="group animate-in slide-in-from-bottom-2 duration-300 fade-in"
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isUserComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-red-500 hover:text-red-600 transition-all"
                          title="Delete your comment"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg rounded-tl-none group-hover:bg-gray-100 transition-colors duration-200">
                      {comment.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSubmitComment} className="relative">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                className="w-full bg-gray-50 text-gray-900 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-gray-400 border border-gray-300 transition-all duration-200"
                aria-label="Comment input"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white disabled:opacity-40 disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-blue-700 enabled:hover:scale-105 transition-all duration-200 active:scale-95"
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
