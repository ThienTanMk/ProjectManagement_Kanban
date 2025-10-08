import {
  getNotifications,
  markNotificationAsRead,
} from "@/services/notificationApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useProjectStore } from "../stores/projectStore";
import { auth } from "@/lib/firebase";
import { queryClient } from "@/services/queryClient";

export function useGetNotifications() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["notifications", currentProjectId, uid],
    queryFn: getNotifications,
    refetchInterval: 1000,
  });
}

export function useMarkNotificationAsRead() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", currentProjectId, uid],
      });
    },
  });
}
