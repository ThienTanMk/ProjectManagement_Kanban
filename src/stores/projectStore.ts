import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface ProjectState {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  clearData: () => void;
}
export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      currentProjectId: null,
      setCurrentProjectId: (id) => set({ currentProjectId: id }),
      clearData: () => set({ currentProjectId: null }),
    }),
    {
      name: "project-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
