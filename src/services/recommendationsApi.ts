import { instance } from "./axios";
import {
  AIRecommendation,
  SubmitFeedbackDto,
  UpdateRecommendationStatusDto,
  FeedbackAnalytics,
  RecommendationStatus,
} from "@/types/api";

export const recommendationsApi = {
  // GET /recommendations
  getRecommendations: async (params?: {
    status?: RecommendationStatus;
    projectId?: string;
    includeExpired?: boolean;
  }): Promise<AIRecommendation[]> => {
    const res = await instance.get<AIRecommendation[]>("/recommendations", { params });
    return res.data;
  },

  // GET /recommendations/expiring?days=2
  getExpiringRecommendations: async (daysUntilExpiry = 2): Promise<AIRecommendation[]> => {
    const res = await instance.get<AIRecommendation[]>("/recommendations/expiring", {
      params: { days: daysUntilExpiry },
    });
    return res.data;
  },

  // GET /recommendations/analytics?projectId=xxx
  getAnalytics: async (projectId?: string): Promise<FeedbackAnalytics> => {
    const res = await instance.get<FeedbackAnalytics>("/recommendations/analytics", {
      params: projectId ? { projectId } : {},
    });
    return res.data;
  },

  // GET /recommendations/:id
  getRecommendation: async (id: string): Promise<AIRecommendation> => {
    const res = await instance.get<AIRecommendation>(`/recommendations/${id}`);
    return res.data;
  },

  // POST /recommendations/:id/feedback
  submitFeedback: async (id: string, dto: SubmitFeedbackDto): Promise<{ success: true }> => {
    const res = await instance.post(`/recommendations/${id}/feedback`, dto);
    return res.data;
  },

  // POST /recommendations/:id/status
  updateStatus: async (
    id: string,
    dto: UpdateRecommendationStatusDto
  ): Promise<AIRecommendation> => {
    const res = await instance.post<AIRecommendation>(`/recommendations/${id}/status`, dto);
    return res.data;
  },
};