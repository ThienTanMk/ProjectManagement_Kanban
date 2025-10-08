import { Invite, ProjectRole } from "@/types/api";
import { instance } from "./axios";

export async function addInvite(
  email: string,
  role: ProjectRole = ProjectRole.MEMBER
): Promise<Invite> {
  const response = await instance.post("/invites", {
    email,
    role,
  });
  return response.data;
}

export async function getInvites(projectId: string): Promise<Invite[]> {
  const response = await instance.get(`/invites/projects/${projectId}`);
  return response.data;
}

export async function deleteInvite(id: string): Promise<{ id: string }> {
  const response = await instance.delete(`/invites/${id}`);
  return response.data;
}
