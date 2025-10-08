import { StatusTask } from "@/types/api";
import { instance } from "./axios";

export async function addStatus(name: string): Promise<StatusTask> {
  const response = await instance.post("/statuses", { name });
  return response.data;
}

export async function getStatuses(): Promise<StatusTask[]> {
  const response = await instance.get("/statuses");
  return response.data;
}

export async function updateStatus(
  id: string,
  name: string
): Promise<StatusTask> {
  const response = await instance.put(`/statuses/${id}`, { name });
  return response.data;
}

export async function deleteStatus(id: string): Promise<{ id: string }> {
  const response = await instance.delete(`/statuses/${id}`);
  return response.data;
}
