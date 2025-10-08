import { auth } from "@/lib/firebase";
import { addInvite, deleteInvite, getInvites } from "@/services/inviteApi";
import { queryClient } from "@/services/queryClient";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectRole } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetInvites() {
  const uid = auth.currentUser?.uid;
  const { currentProjectId } = useProjectStore();
  return useQuery({
    queryKey: ["invites", uid, currentProjectId],
    queryFn: () => getInvites(currentProjectId as string),
    enabled: !!uid && !!currentProjectId,
  });
}

export function useAddInvite() {
  const uid = auth.currentUser?.uid;
  const { currentProjectId } = useProjectStore();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: ProjectRole }) =>
      addInvite(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invites", uid, currentProjectId],
      });
    },
  });
}

export function useDeleteInvite() {
  const uid = auth.currentUser?.uid;
  const { currentProjectId } = useProjectStore();
  return useMutation({
    mutationFn: (id: string) => deleteInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invites", uid, currentProjectId],
      });
    },
  });
}
