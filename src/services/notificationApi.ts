import { instance } from "./axios";

export async function getNotifications() {
  const response = await instance.get("/notifications");
  return response.data;
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await instance.post(`/notifications/${notificationId}/read`);
  return response.data;
}
