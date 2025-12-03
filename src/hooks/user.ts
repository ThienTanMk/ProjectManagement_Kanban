import { queryClient } from "@/services/queryClient";
import { getAvailableUsers, getMe, updateMe } from "@/services/userApi";
import { useProjectStore } from "@/stores/projectStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useUserStore } from "@/stores/userStore";
import { create } from 'zustand';

export function useGetMe() {
  const { uid } = useAuth();
  const setUser = useUserStore((state) => state.setUser);
  return useQuery({
    queryKey: ["user", uid],
    queryFn: async () => {
      const me = await getMe();
      setUser(me);
      return me;
    },
    enabled: !!uid,
  });
}

export function useUpdateMe() {
  const { uid } = useAuth();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", uid],
      });
    },
  });
}

export function useGetAvailableUsers() {
  const { currentProjectId } = useProjectStore();
  return useQuery({
    queryKey: ["users", "available", currentProjectId],
    queryFn: getAvailableUsers,
  });
}

interface ProfileCompletionStore {
  pendingProjectId: string | null;
  setPendingProjectId: (id: string | null) => void;
  shouldShowProfileModal: boolean;
  setShouldShowProfileModal: (show: boolean) => void;
}

export const useProfileCompletionStore = create<ProfileCompletionStore>((set) => ({
  pendingProjectId: null,
  setPendingProjectId: (id) => set({ pendingProjectId: id }),
  shouldShowProfileModal: false,
  setShouldShowProfileModal: (show) => set({ shouldShowProfileModal: show }),
}));