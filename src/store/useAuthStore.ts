import { create } from 'zustand';
import { MappedUser } from '../types';

interface AuthStore {
  user: MappedUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  setUser: (user: MappedUser | null) => void;
  setAdmin: (isAdmin: boolean | 'superadmin' | 'subadmin') => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (module: keyof MappedUser['permissions']) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  setUser: (user) => {
    const isHardcodedSuperAdmin = user?.email === 'nahid.mfal.mis@gmail.com';
    const isSuperAdmin = user?.role === 'superadmin' || isHardcodedSuperAdmin;
    const isAdmin = user?.role === 'superadmin' || user?.role === 'subadmin' || isHardcodedSuperAdmin;
    if (user && isHardcodedSuperAdmin) user.role = 'superadmin';
    set({ user, loading: false, isAdmin, isSuperAdmin });
  },
  setAdmin: (role) => {
    const isAdmin = role === 'superadmin' || role === 'subadmin' || role === true;
    const isSuperAdmin = role === 'superadmin';
    set({ isAdmin, isSuperAdmin });
  },
  setLoading: (loading) => set({ loading }),
  hasPermission: (module) => {
    const state = get();
    if (state.isSuperAdmin) return true;
    if (!state.user || !state.user.permissions) return false;
    return !!(state.user.permissions as any)[module];
  }
}));
