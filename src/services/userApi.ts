import { User } from "@/types/api";
import { instance } from "./axios";

export async function getMe(): Promise<User> {
  const response = await instance.get("/users/me");
  return response.data;
}

export async function updateMe(params: Partial<User>): Promise<User> {
  const response = await instance.patch("/users/me", params);
  return response.data;
}

export async function getAvailableUsers(): Promise<User[]> {
  const response = await instance.get("/users/available");
  return response.data;
}
