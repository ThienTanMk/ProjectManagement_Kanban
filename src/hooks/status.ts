import { auth } from "@/lib/firebase";
import { queryClient } from "@/services/queryClient";
import {
  addStatus,
  getStatuses,
  updateStatus,
  deleteStatus,
} from "@/services/statusApi";
import { useProjectStore } from "@/stores/projectStore";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetStatuses() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["statuses", currentProjectId, uid],
    queryFn: getStatuses,
    enabled: !!currentProjectId && !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useAddStatus() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useMutation({
    mutationFn: (status: string) => addStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statuses", currentProjectId, uid],
      });
    },
  });
}

export function useUpdateStatus() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useMutation({
    mutationFn: ({
      id,
      name,
      position,
    }: {
      id: string;
      name: string;
      position: number;
    }) => updateStatus(id, name, position),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statuses", currentProjectId, uid],
      });
    },
  });
}

export function useDeleteStatus() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useMutation({
    mutationFn: (id: string) => deleteStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["statuses", currentProjectId, uid],
      });
    },
  });
}
