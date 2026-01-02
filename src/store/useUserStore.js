import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      userId: uuidv4(),
      userName: '',
      setUserName: (name) => set({ userName: name }),
    }),
    {
      name: 'gallery-user-storage',
    }
  )
);
