import {
  connectSSE,
  connectSSEWithAuth,
  deleteNotificationApi,
  getNotificationById,
  getNotifications,
  getUnreadCount,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notificationApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useProjectStore } from "../stores/projectStore";
import { auth } from "@/lib/firebase";
import { queryClient } from "@/services/queryClient";
import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

export function useGetNotifications() {
  const { uid } = useAuth();
  const queryKey = ["notifications"];
  const sseRef = useRef<any>(null);

  const query = useQuery({
    queryKey,
    queryFn: getNotifications,
    enabled: !!uid,
  });

  useEffect(() => {
    if (!uid) return;

    let isActive = true;

    const setupSSE = async () => {
      try {
        const { reader, decoder, close } = await connectSSEWithAuth();
        sseRef.current = { close };

        while (isActive) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          queryClient.invalidateQueries({ queryKey });
          queryClient.invalidateQueries({
            queryKey: ["unreadCount"],
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: ["unreadNotifications"],
            exact: false,
          });
          const lines = text.split("\n\n");

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data:")) continue;

            try {
              const jsonStr = line.replace("data:", "").trim();
              const data = JSON.parse(jsonStr);

              if (data.type === "heartbeat" || data.type === "connected") {
                continue;
              }
            } catch (err) {
              console.warn("Failed to parse SSE data:", err);
            }
          }
        }
      } catch (error) {
        console.error("SSE error:", error);
        if (isActive) {
          setTimeout(setupSSE, 2000);
        }
      }
    };

    setupSSE();

    return () => {
      isActive = false;
      sseRef.current?.close();
    };
  }, [uid]);

  return query;
}

export function useGetUnreadNotifications() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: getUnreadNotifications,
    enabled: !!uid && !!currentProjectId,
  });
}

export function useGetUnreadCount() {
  const { uid } = useAuth();
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCount,
    enabled: !!uid,
  });
}

export function useGetNotificationById(id: string) {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["notification", id, currentProjectId, uid],
    queryFn: () => getNotificationById(id),
    enabled: !!id && !!uid && !!currentProjectId,
  });
}

export function useMarkNotificationAsRead() {
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount"],
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { uid } = useAuth();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount"],
      });
    },
  });
}

export function useDeleteNotification() {
  return useMutation({
    mutationFn: (id: string) => deleteNotificationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount"],
      });
    },
  });
}
