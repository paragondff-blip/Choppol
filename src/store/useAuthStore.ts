import { create } from 'zustand';
import { User } from 'firebase/auth';

interface MappedUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role?: string;
  hasSeenAdminAlert?: boolean;
}

interface AuthStore {
  user: MappedUser | null;
  loading: boolean;
  isAdmin: boolean;
  setUser: (user: MappedUser | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  isAdmin: false,
  setUser: (user) => set({ user, loading: false }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (loading) => set({ loading }),
}));
