import { User } from "@/types/api";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface UserState {
  user: User | null;
  clearData: () => void;
  setUser: (user: User | null) => void;
}
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      clearData: () => set({ user: null }),
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
