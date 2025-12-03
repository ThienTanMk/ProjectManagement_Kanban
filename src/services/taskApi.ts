import {
  CreateSubtaskDto,
  CreateTaskDto,
  CreateTaskWithAIDto,
  Task,
  UpdateTaskDto,
  AITaskCreationResponse,
  AITaskStatusResponse,
} from "../types/api";
import { instance } from "./axios";

export const taskApi = {
  getTasksByProject: async (
    projectId: string,
    page = 1,
    limit = 50
  ): Promise<Task[]> => {
    const response = await instance.get(
      `/projects/${projectId}/tasks?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  getTasks: async (params: {
    page?: number;
    limit?: number;
    projectId?: string;
  }) => {
    const response = await instance.get("/tasks", { params });
    return response.data;
  },
  getTask: async (id: string): Promise<Task> => {
    const response = await instance.get(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (data: CreateTaskDto): Promise<Task> => {
    const response = await instance.post("/tasks", data);
    return response.data;
  },
  updateTask: async (id: string, data: UpdateTaskDto): Promise<Task> => {
    const response = await instance.put(`/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: string): Promise<{ id: string }> => {
    const response = await instance.delete(`/tasks/${id}`);
    return response.data;
  },
  updateTaskStatus: async (id: string, statusId: string): Promise<Task> => {
    const response = await instance.patch(`/tasks/${id}/status`, { statusId });
    return response.data;
  },
  createSubtask: async (
    parentTaskId: string,
    data: CreateSubtaskDto
  ): Promise<Task> => {
    const response = await instance.post(
      `/tasks/${parentTaskId}/subtasks`,
      data
    );
    return response.data;
  },
  getSubtasks: async (parentTaskId: string): Promise<Task[]> => {
    const response = await instance.get(`/tasks/${parentTaskId}/subtasks`);
    return response.data;
  },
  createTaskWithAI: async (
    data: CreateTaskWithAIDto
  ): Promise<AITaskCreationResponse> => {
    const response = await instance.post("/tasks/ai", data);
    return response.data;
  },
  getAITaskCreationStatus: async (
    executionId: string
  ): Promise<AITaskStatusResponse> => {
    const response = await instance.get(`/tasks/ai/status/${executionId}`);
    return response.data;
  },
  assignTask: async (id: string, userId: string) => {
    const response = await instance.post(`/tasks/${id}/assign`, { userId });
    return response.data;
  },
  assignTaskWithAI: async (id: string) => {
    const response = await instance.post(`/tasks/${id}/assign-ai`);
    return response.data;
  },
  getAssignTaskStatus: async (executionId: string) => {
    const response = await instance.get(
      `/tasks/assign-ai/status/${executionId}`
    );
    return response.data;
  },
  breakDownTask: async (id: string) => {
    const response = await instance.post(`/tasks/${id}/break-down`);
    return response.data;
  },
  getBreakDownStatus: async (executionId: string) => {
    const response = await instance.get(
      `/tasks/break-down/status/${executionId}`
    );
    return response.data;
  },
};
