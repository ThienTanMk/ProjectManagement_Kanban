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

// export function useGetNotifications() {
//   const { currentProjectId } = useProjectStore();
//   const uid = auth.currentUser?.uid;
//   return useQuery({
//     queryKey: ["notifications", currentProjectId, uid],
//     queryFn: getNotifications,
//     refetchInterval: 1000,
//   });
// }

// export function useMarkNotificationAsRead() {
//   const { currentProjectId } = useProjectStore();
//   const uid = auth.currentUser?.uid;
//   return useMutation({
//     mutationFn: (id: string) => markNotificationAsRead(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["notifications", currentProjectId, uid],
//       });
//     },
//   });
// }

// Lấy tất cả notifications + SSE auto-refetch
export function useGetNotifications() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  const queryKey = ["notifications", currentProjectId, uid];
  const sseRef = useRef<any>(null);

  const query = useQuery({
    queryKey,
    queryFn: getNotifications,
    enabled: !!uid && !!currentProjectId,
  });

  //SSE: Auto refetch khi có notification mới
  useEffect(() => {
    if (!uid) return;

    let isActive = true;

    const setupSSE = async () => {
      console.log('Setting up SSE connection for user:', uid); // Thêm log này
      try {
        const { reader, decoder, close } = await connectSSEWithAuth();
        sseRef.current = { close };
        
        // Đọc stream
        while (isActive) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n\n');

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data:')) continue;

            try {
              const jsonStr = line.replace('data:', '').trim();
              const data = JSON.parse(jsonStr);

              // Bỏ qua heartbeat
              if (data.type === 'heartbeat') continue;

              // Có notification mới -> refetch
              console.log('📬 New SSE notification:', data);
              queryClient.invalidateQueries({ queryKey });
              queryClient.invalidateQueries({ 
                queryKey: ["unreadCount", currentProjectId, uid] 
              });
            } catch (err) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      } catch (error) {
        console.error("SSE error:", error);
        // Retry sau 2s
        if (isActive) {
          setTimeout(setupSSE, 2000);
        }
      }
    };

    setupSSE();

    // Cleanup
    return () => {
      isActive = false;
      sseRef.current?.close();
    };
  }, [uid]);

  return query;
}

// Lấy unread notifications
export function useGetUnreadNotifications() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["unreadNotifications", currentProjectId, uid],
    queryFn: getUnreadNotifications,
    enabled: !!uid && !!currentProjectId,
  });
}

// Đếm số unread
export function useGetUnreadCount() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["unreadCount", currentProjectId, uid],
    queryFn: getUnreadCount,
    enabled: !!uid && !!currentProjectId,
  });
}

//  Lấy 1 notification theo ID
export function useGetNotificationById(id: string) {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ["notification", id, currentProjectId, uid],
    queryFn: () => getNotificationById(id),
    enabled: !!id && !!uid && !!currentProjectId,
  });
}

//  Mark 1 notification as read
export function useMarkNotificationAsRead() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["notifications", currentProjectId, uid] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["unreadNotifications", currentProjectId, uid] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["unreadCount", currentProjectId, uid] 
      });
    },
  });
}

// Mark ALL notifications as read
export function useMarkAllNotificationsAsRead() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["notifications", currentProjectId, uid] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["unreadNotifications", currentProjectId, uid] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["unreadCount", currentProjectId, uid] 
      });
    },
  });
}

// DELETE
export function useDeleteNotification() {
  const { currentProjectId } = useProjectStore();
  const uid = auth.currentUser?.uid;
  
  return useMutation({
    mutationFn: (id: string) => deleteNotificationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["notifications", currentProjectId, uid] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["unreadNotifications", currentProjectId, uid] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["unreadCount", currentProjectId, uid] 
      });
    },
  });
}