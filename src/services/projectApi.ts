import {
  Project,
  ProjectCreateRequest,
  ProjectRole,
  ProjectUpdateRequest,
  UsersOnProject,
} from "../types/api";
import { instance } from "./axios";

export const projectApi = {
  getProjects: async (page = 1, limit = 10): Promise<Project[]> => {
    const response = await instance.get(
      `/projects?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  getProject: async (id: string): Promise<Project> => {
    const response = await instance.get(`/projects/${id}`);
    return response.data;
  },
  createProject: async (data: ProjectCreateRequest): Promise<Project> => {
    const response = await instance.post("/projects", data);
    return response.data;
  },
  updateProject: async (
    id: string,
    data: ProjectUpdateRequest
  ): Promise<Project> => {
    const response = await instance.patch(`/projects/${id}`, data);
    return response.data;
  },
  deleteProject: async (id: string): Promise<Project> => {
    const response = await instance.delete(`/projects/${id}`);
    return response.data;
  },

  getTeamMembers: async (projectId: string): Promise<UsersOnProject[]> => {
    const response = await instance.get(`/projects/${projectId}/team`);
    return response.data;
  },

  getRoleOnProject: async (projectId: string): Promise<ProjectRole> => {
    const response = await instance.get(`/projects/${projectId}/role`);
    return response.data;
  },
};
