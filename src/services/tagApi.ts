import { Tags } from "@/types/api";
import { instance } from "./axios";

export async function addTag(data: {
  name: string;
  color: string;
}): Promise<Tags> {
  const response = await instance.post("/tags", data);
  return response.data;
}

export async function getTags(): Promise<Tags[]> {
  const response = await instance.get("/tags");
  return response.data;
}
