import { create } from 'zustand';
import { persist } from 'zustand/middleware'; //persist is middleware that automatically saves and restores store data from storage.
import type { User } from '@/types';

interface AuthState{
    user: User | null; 
    isAuthenticated: boolean; 
    setUser: (user: User) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // key in localStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      // partialize — tells Zustand which parts of the store to persist.
    }
  )
);

