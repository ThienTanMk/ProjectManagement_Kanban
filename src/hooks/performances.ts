import { useQuery } from "@tanstack/react-query";
import { performancesApi } from "@/services/performancesApi";

export const performanceKeys = {
  velocity: (projectId: string) =>
    ["performances", "velocity", projectId] as const,
  sprint: (projectId: string, start: string, end: string) =>
    ["performances", "sprint", projectId, start, end] as const,
  health: (projectId: string) => ["performances", "health", projectId] as const,
  forecast: (projectId: string) =>
    ["performances", "forecast", projectId] as const,
  user: (userId: string, days?: number) =>
    ["performances", "user", userId, days ?? 30] as const,
  team: (projectId: string) => ["performances", "team", projectId] as const,
  aiAnalysis: (projectId: string, userId: string, conversationId?: string) =>
    [
      "performances",
      "ai-analysis",
      projectId,
      userId,
      conversationId ?? "none",
    ] as const,
};

export const useVelocity = (projectId: string) => {
  return useQuery({
    queryKey: performanceKeys.velocity(projectId),
    enabled: !!projectId,
    queryFn: () => performancesApi.getVelocity(projectId),
    staleTime: 1000 * 60 * 10,
  });
};

export const useSprintReport = (
  projectId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: performanceKeys.sprint(projectId, startDate, endDate),
    queryFn: () =>
      performancesApi.getSprintReport(projectId, startDate, endDate),
    enabled: !!projectId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 30,
  });
};

export const useProjectHealth = (projectId: string) => {
  return useQuery({
    queryKey: performanceKeys.health(projectId),
    enabled: !!projectId,
    queryFn: () => performancesApi.getHealthReport(projectId),
    staleTime: 1000 * 60 * 15,
  });
};

export const useCompletionForecast = (projectId: string) => {
  return useQuery({
    enabled: !!projectId,
    queryKey: performanceKeys.forecast(projectId),
    queryFn: () => performancesApi.getCompletionForecast(projectId),
    staleTime: 1000 * 60 * 60, // 1 giờ
  });
};

export const useUserPerformance = (userId: string, days?: number) => {
  return useQuery({
    queryKey: performanceKeys.user(userId, days),
    queryFn: () => performancesApi.getUserPerformance(userId, days),
    enabled: !!userId,
    staleTime: 1000 * 60 * 20,
  });
};

export const useTeamMetrics = (projectId: string) => {
  return useQuery({
    enabled: !!projectId,
    queryKey: performanceKeys.team(projectId),
    queryFn: () => performancesApi.getTeamMetrics(projectId),
    staleTime: 1000 * 60 * 15,
  });
};

export const useAIAnalysis = (
  projectId: string,
  userId: string,
  conversationId?: string
) => {
  return useQuery({
    queryKey: performanceKeys.aiAnalysis(projectId, userId, conversationId),
    queryFn: () =>
      performancesApi.analyzeWithAI(projectId, userId, conversationId),
    enabled: !!projectId && !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
