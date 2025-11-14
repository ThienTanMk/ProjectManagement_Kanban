import { instance } from "./axios";
import { auth } from "@/lib/firebase";
import { useProjectStore } from "@/stores/projectStore";

export async function getNotifications() {
  const response = await instance.get("/notifications");
  return response.data;
}

export async function getNotificationById(id: string) {
  const response = await instance.get(`/notifications/${id}`);
  return response.data;
}

export async function getUnreadNotifications() {
  const response = await instance.get("/notifications/unread");
  return response.data;
}

export async function getUnreadCount() {
  const response = await instance.get("/notifications/unread/count");
  return response.data;
}

export async function markNotificationAsRead(id: string) {
  const response = await instance.patch(`/notifications/${id}/read`, { read: true });
  return response.data;
}

export async function markAllNotificationsAsRead() { 
  const response = await instance.post(`/notifications/mark-all-read`);
  return response.data;
}

export async function deleteNotificationApi(id: string) {
  const response = await instance.delete(`/notifications/${id}`);
  return response.data;
}

// SSE: Kết nối real-time notification stream
export async function connectSSE() {
  const url = `${instance.defaults.baseURL}/notifications/sse`;

  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("No auth token");

    const projectId = useProjectStore.getState().currentProjectId || "";

    // Create EventSource with auth token in URL
    const eventSource = new EventSource(`${url}?token=${token}`, {
      withCredentials: true,
    });

    // Handle connection open
    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    // Handle connection error
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received notification:', data);
      // Handle the notification data here
    };

    return eventSource;
  } catch (error) {
    console.error("SSE connection error:", error);
    throw error;
  }
}

// SSE với custom headers
export async function connectSSEWithAuth() {
  const url = `${instance.defaults.baseURL}/notifications/sse`;
  
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("No auth token");

    const projectId = useProjectStore.getState().currentProjectId || "";

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Project-Id': projectId,
        'Cache-Control': 'no-cache',
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) throw new Error('SSE connection failed');
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    console.log('SSE connection established successfully');

    return {
      reader,
      decoder,
      close: () => {
        console.log('Closing SSE connection');
        return reader.cancel();
      },
    };
  } catch (error) {
    console.error("SSE connection error:", error);
    throw error;
  }
}