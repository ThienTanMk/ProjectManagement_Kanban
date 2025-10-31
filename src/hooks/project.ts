import { useMutation, useQuery } from "@tanstack/react-query";
import { projectApi } from "../services/projectApi";
import { ProjectCreateRequest, ProjectUpdateRequest } from "../types/api";
import { queryClient } from "@/services/queryClient";
import { useAuth } from "./useAuth";
import { useProjectStore } from "@/stores/projectStore";
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: Record<string, any>, uid: string | undefined) =>
    [...projectKeys.lists(), { filters, uid }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string, uid?: string | undefined) =>
    [...projectKeys.details(), id, uid] as const,
  userProjects: (uid: string | undefined) =>
    [...projectKeys.all, "user-projects", uid] as const,
  teamMembers: (projectId: string, uid: string|undefined) =>
    [...projectKeys.all, "team-members", projectId, uid] as const
};
export const useProjects = (page = 1, limit = 10) => {
  const { uid } = useAuth();
  return useQuery({
    queryKey: projectKeys.list({ page, limit }, uid),
    queryFn: () => projectApi.getProjects(page, limit),
    staleTime: 5 * 60 * 1000,
    enabled: !!uid,
  });
};
export const useUserProjects = () => {
  const { uid } = useAuth();
  return useQuery({
    queryKey: projectKeys.userProjects(uid),
    queryFn: () => projectApi.getProjects(),
    staleTime: 5 * 60 * 1000,
    enabled: !!uid,
  });
};
export const useProject = (id: string | null) => {
  const { uid } = useAuth();
  return useQuery({
    queryKey: projectKeys.detail(id as string, uid),
    queryFn: () => projectApi.getProject(id as string),
    enabled: !!id && !!uid,
    staleTime: 5 * 60 * 1000,
  });
};
export const useCreateProject = () => {
  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => projectApi.createProject(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};
export const useUpdateProject = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateRequest }) =>
      projectApi.updateProject(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.id),
      });
    },
  });
};
export const useDeleteProject = () => {
  return useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(id),
      });
    },
  });
};

export const useGetRoleOnProject = () => {
  const { uid } = useAuth();
  const { currentProjectId } = useProjectStore();
  return useQuery({
    queryKey: projectKeys.detail(currentProjectId as string),
    queryFn: () => projectApi.getRoleOnProject(currentProjectId as string),
    enabled: !!currentProjectId && !!uid,
    staleTime: 5 * 60 * 1000,
  });
};


export const useGetProject = (projectId: string | null) => {
  const { uid } = useAuth();
  return useQuery({
    queryKey: projectKeys.detail(projectId as string, uid),
    queryFn: () => projectApi.getProject(projectId as string),
    enabled: !!projectId && !!uid,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetTeamMembers = () => {
  const { uid } = useAuth();
  const { currentProjectId } = useProjectStore();
  return useQuery({
    queryKey: projectKeys.teamMembers(currentProjectId as string, uid),
    queryFn: () => projectApi.getTeamMembers(currentProjectId as string),
    enabled: !!currentProjectId && !!uid,
    staleTime: 5 * 60 * 1000,
  });
};