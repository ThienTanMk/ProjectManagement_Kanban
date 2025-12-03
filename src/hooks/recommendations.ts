import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recommendationsApi } from "@/services/recommendationsApi";
import {
  AIRecommendation,
  SubmitFeedbackDto,
  RecommendationStatus,
} from "@/types/api";

export const recommendationKeys = {
  all: ["recommendations"] as const,
  lists: () => [...recommendationKeys.all, "list"] as const,
  list: (filters: Partial<{
    status: RecommendationStatus;
    projectId: string;
    includeExpired: boolean;
  }>) => [...recommendationKeys.lists(), filters] as const,
  detail: (id: string) => [...recommendationKeys.all, id] as const,
  expiring: (days: number) => [...recommendationKeys.all, "expiring", days] as const,
  analytics: (projectId?: string) =>
    [...recommendationKeys.all, "analytics", projectId ?? "global"] as const,
};

export const useRecommendations = (filters?: {
  status?: RecommendationStatus;
  projectId?: string;
  includeExpired?: boolean;
}) => {
  return useQuery({
    queryKey: recommendationKeys.list(filters ?? {}),
    queryFn: () => recommendationsApi.getRecommendations(filters),
    staleTime: 1000 * 60 * 2, // 2 phút
  });
};

export const useExpiringRecommendations = (daysUntilExpiry = 2) => {
  return useQuery({
    queryKey: recommendationKeys.expiring(daysUntilExpiry),
    queryFn: () => recommendationsApi.getExpiringRecommendations(daysUntilExpiry),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecommendationAnalytics = (projectId?: string) => {
  return useQuery({
    queryKey: recommendationKeys.analytics(projectId),
    queryFn: () => recommendationsApi.getAnalytics(projectId),
    staleTime: 1000 * 60 * 10, // 10 phút
  });
};

export const useRecommendation = (id: string) => {
  return useQuery({
    queryKey: recommendationKeys.detail(id),
    queryFn: () => recommendationsApi.getRecommendation(id),
    enabled: !!id,
  });
};

export const useSubmitFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SubmitFeedbackDto }) =>
      recommendationsApi.submitFeedback(id, dto),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: recommendationKeys.lists() });
      qc.invalidateQueries({ queryKey: recommendationKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: recommendationKeys.analytics() });
    },
  });
};

export const useUpdateRecommendationStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecommendationStatus }) =>
      recommendationsApi.updateStatus(id, { status }),
    onSuccess: (updatedRec) => {
      qc.setQueryData(recommendationKeys.detail(updatedRec.id), updatedRec);
      qc.setQueryData<AIRecommendation[]>(
        recommendationKeys.lists(),
        (old = []) => old.map((r) => (r.id === updatedRec.id ? updatedRec : r))
      );
      qc.invalidateQueries({ queryKey: recommendationKeys.analytics() });
    },
  });
};