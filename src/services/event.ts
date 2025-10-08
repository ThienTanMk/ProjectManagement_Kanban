import { instance } from "./axios";

export async function getEventByTaskId(taskId: string) {
  const res = await instance.get(`/events/tasks/${taskId}`);
  return res.data;
}
