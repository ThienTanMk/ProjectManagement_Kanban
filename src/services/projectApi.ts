import {
  AddMemberRequest,
  Project,
  ProjectCreateRequest,
  ProjectRole,
  ProjectUpdateRequest,
  Task,
  UpdateMemberProfileDto,
  UpdateMemberRoleDto,
  UpdateMemberRoleRequest,
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
    const response = await instance.get(`/projects/${projectId}/members`);
    return response.data;
  },

  //  lấy danh sách task trong project
  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    const response = await instance.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  //  thêm thành viên vào project
  addMember: async (projectId: string, data: AddMemberRequest): Promise<UsersOnProject> => {
    const response = await instance.post(`/projects/${projectId}/members`, data);
    return response.data;
  },

  // xoá thành viên khỏi project
  removeMember: async (projectId: string, memberId: string): Promise<void> => {
    await instance.delete(`/projects/${projectId}/members/${memberId}`);
  },

  // cập nhật vai trò của thành viên
  updateMemberRole: async (
    projectId: string,
    memberId: string,
    data: UpdateMemberRoleDto
  ): Promise<UsersOnProject> => {
    const response = await instance.put(`/projects/${projectId}/members/${memberId}/role`, data);
    return response.data;
  },

  updateMemberProfile: async (
    projectId: string,
    memberId: string,
    data: UpdateMemberProfileDto
  ): Promise<UsersOnProject> => {
    const response = await instance.put(`/projects/${projectId}/members/${memberId}/profile`, data);
    return response.data;
  },


  getRoleOnProject: async (projectId: string): Promise<ProjectRole> => {
    const response = await instance.get(`/projects/${projectId}/role`);
    return response.data;
  },
};
