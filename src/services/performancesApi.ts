import { instance } from "./axios";
import {
  VelocityResponse,
  SprintReport,
  ProjectHealthReport,
  CompletionForecast,
  UserPerformance,
  AIAnalysisResponse,
  AIAnalysisStatusResponse,
} from "@/types/api";

export const performancesApi = {
  // GET /performances/velocity/:projectId
  getVelocity: async (projectId: string): Promise<VelocityResponse> => {
    const res = await instance.get(`/performances/velocity/${projectId}`);
    return res.data;
  },

  // GET /performances/sprint/:projectId?startDate=&endDate=
  getSprintReport: async (
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<SprintReport> => {
    const res = await instance.get(`/performances/sprint/${projectId}`, {
      params: { startDate, endDate },
    });
    return res.data;
  },

  // GET /performances/health/:projectId
  getHealthReport: async (projectId: string): Promise<ProjectHealthReport> => {
    const res = await instance.get(`/performances/health/${projectId}`);
    return res.data;
  },

  // GET /performances/forecast/:projectId
  getCompletionForecast: async (
    projectId: string
  ): Promise<CompletionForecast> => {
    const res = await instance.get(`/performances/forecast/${projectId}`);
    return res.data;
  },

  // GET /performances/user/:userId?days=30
  getUserPerformance: async (
    userId: string,
    days = 30
  ): Promise<UserPerformance> => {
    const res = await instance.get(`/performances/user/${userId}`, {
      params: { days },
    });
    return res.data;
  },

  // GET /performances/team/:projectId (dùng chung health report)
  getTeamMetrics: async (projectId: string): Promise<ProjectHealthReport> => {
    const res = await instance.get(`/performances/team/${projectId}`);
    return res.data;
  },

  // POST /performances/ai-analysis - Start async AI analysis
  startAIAnalysis: async (
    projectId: string,
    userId: string,
    conversationId?: string
  ): Promise<{ executionId: string; status: string; message: string }> => {
    const res = await instance.post(`/performances/ai-analysis`, {
      projectId,
      userId,
      conversationId,
    });
    return res.data;
  },

  // GET /performances/ai-analysis/status/:executionId - Check status
  getAIAnalysisStatus: async (
    executionId: string
  ): Promise<AIAnalysisStatusResponse> => {
    const res = await instance.get(
      `/performances/ai-analysis/status/${executionId}`
    );
    return res.data;
  },

  // Legacy GET endpoint - now returns executionId for polling
  analyzeWithAI: async (
    projectId: string,
    userId: string,
    conversationId?: string
  ): Promise<AIAnalysisResponse> => {
    const res = await instance.get(`/performances/ai-analysis/${projectId}`, {
      params: { userId, conversationId },
    });
    return res.data;
  },
};
