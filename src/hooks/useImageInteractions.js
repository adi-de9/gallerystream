import { db } from '../lib/instantdb';
import { useUserStore } from '../store/useUserStore';
import { v4 as uuidv4 } from 'uuid';

export const useImageInteractions = (imageId) => {
  const { userId, userName } = useUserStore();

  const { isLoading, error, data } = db.useQuery({
    reactions: {
      $: {
        where: { imageId },
      },
    },
    comments: {
      $: {
        where: { imageId },
      },
    },
  });

  const addReaction = (emoji, imageUrl) => {
    // Find if user already reacted
    const existingReaction = (data?.reactions || []).find(r => r.userId === userId);

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Toggle off (remove) if clicking same emoji
        db.transact(db.tx.reactions[existingReaction.id].delete());
      } else {
        // Replace with new emoji
        db.transact(
          db.tx.reactions[existingReaction.id].update({
            emoji,
            createdAt: Date.now(), 
          })
        );
      }
    } else {
      // Add new reaction
      db.transact(
        db.tx.reactions[uuidv4()].update({
          imageId,
          userId,
          userName,
          emoji,
          imageUrl,
          createdAt: Date.now(),
        })
      );
    }
  };

  const addComment = (text, imageUrl) => {
    db.transact(
      db.tx.comments[uuidv4()].update({
        imageId,
        userId,
        userName,
        text,
        imageUrl,
        createdAt: Date.now(),
      })
    );
  };

  return {
    isLoading,
    error,
    reactions: data?.reactions || [],
    comments: data?.comments || [],
    addReaction,
    addComment,
  };
};
