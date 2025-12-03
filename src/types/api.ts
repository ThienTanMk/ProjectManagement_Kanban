// Base Entity Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  phone?: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  ownerId: string;
  archived?: boolean;
  role?: ProjectRole;
}

export interface UsersOnProject {
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: Date;
  level?: Level;
  technologies?: string[];
  profileCompleted?: boolean;
}

export interface TaskState {
  id: string;
  name: string;
  position: number | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tags {
  id: string;
  name: string;
  color: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagOnTask {
  taskId: string;
  tagId: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  file: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Event {
  id: string;
  type: string;
  payload: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  taskId: string | null;
  task?: Task;
  user?: User;
}

export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export interface Invite {
  id: string;
  email: string;
  projectId: string;
  status: InviteStatus;
  createdAt: Date;
  updatedAt: Date;
  role: ProjectRole;
}

export interface Notification {
  id: string;
  eventId: string;
  userId: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  event?: Event;
}
// Enums
export enum ProjectRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum Level {
  JUNIOR = "JUNIOR",
  MID = "MID",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
}

export enum EventType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_DELETED = "COMMENT_DELETED",
  TASK_STATUS_UPDATED = "TASK_STATUS_UPDATED",
  ASSIGNEE_ADDED = "ASSIGNEE_ADDED",
  ASSIGNEE_REMOVED = "ASSIGNEE_REMOVED",
  TAG_ADDED = "TAG_ADDED",
  TAG_REMOVED = "TAG_REMOVED",
  SUBTASK_ADDED = "SUBTASK_ADDED",
  SUBTASK_REMOVED = "SUBTASK_REMOVED",
}

export interface UsersOnProject {
  user: User;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId: string;
  role: ProjectRole;
  level?: Level;
  technologies?: string[];
}

// DTOs based on OpenAPI Schema Components
export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  email?: string;
}

export interface CreateInviteDto {
  email: string;
  projectId: string;
  role?: ProjectRole;
}

// export interface CreateStatusDto {
//   name: string;
//   color?: string;
//   order: number;
//   projectId: string;
// }
export interface CreateStatusDto {
  name: string;
  position?: number;
}

export interface UpdateStatusDto {
  name?: string;
  position?: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  archived?: boolean;
}

// export interface CreateTaskDto
//   extends Omit<
//     Task,
//     "id" | "createdAt" | "updatedAt" | "owner" | "status" | "assignees"
//   > {
//   assignees: string[];
// }

export interface CreateTaskDto {
  name: string;
  description?: string;
  statusId: string;
  tagIds?: string[];
  assignees?: string[];
  deadline?: string;
  actualTime?: number;
  complexity?: number;
  estimatedTime?: number;
  parentTaskId?: string;
  priority?: Priority;
  position?: number;
}

export interface CreateTaskWithAIDto {
  description: string;
  projectId: string;
  requiredSkills?: string[];
  preferredTimeline?: number;
}

export interface AITaskCreationResponse {
  success: boolean;
  executionId: string;
  status: "PENDING";
  message: string;
  estimatedTime?: string;
}

export interface AITaskStatusResponse {
  executionId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  progress: number;
  tasks?: Array<{
    id?: string;
    name?: string;
    description?: string;
    priority?: string;
    estimatedTime?: number;
    complexity?: number;
  }>;
  taskIds?: string[];
  aIRecommendationId?: string | null;
  error?: string | null;
  startedAt?: string;
  completedAt?: string;
  steps?: Array<{
    name: string;
    status: string;
    duration: number;
  }>;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export interface UpdateTaskStatusDto {
  statusId: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
  projectId: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

// export interface CreateNotificationDto {
//   title: string;
//   message: string;
//   userId: string;
//   eventId?: string;
// }

export interface CreateNotificationDto {
  eventId: string;
  userId: string;
}

// export interface UpdateNotificationDto {
//   title?: string;
//   message?: string;
//   isRead?: boolean;
// }
export interface UpdateNotificationDto {
  read?: boolean;
}
export interface MarkReadDto {
  read: boolean;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
  file?: string;
}

export interface UpdateCommentDto {
  content: string;
  file?: string;
}

export interface CreateSubtaskDto {
  name: string;
  description?: string;
  tagIds?: string[];
  assignees?: string[];
  deadline?: Date;
  actualTime?: number;
  complexity?: number;
  estimatedTime?: number;
  priority?: Priority;
  position?: number;
}

export interface CreateUserDto {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface UpdateTaskStateDto {
  name?: string;
  position?: number;
}

// Generic Types
export interface Object {
  [key: string]: any;
}

// Query Parameters
export interface QueryParams {
  filter?: Object;
  orderBy?: string;
  include?: string;
  archived?: boolean;
  page?: number;
  pageSize?: number | Object;
}
// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// User API Types
export type UserResponse = ApiResponse<User>;
export type UserListResponse = PaginatedResponse<User>;
export type AvailableUsersResponse = ApiResponse<User[]>;

// Project API Types
export type ProjectResponse = ApiResponse<Project>;
export type ProjectListResponse = PaginatedResponse<Project>;
export type ProjectTasksResponse = ApiResponse<Task[]>;

// Task API Types
export type TaskResponse = ApiResponse<Task>;
export type TaskListResponse = PaginatedResponse<Task>;

// Status API Types
export type StatusResponse = ApiResponse<TaskState>;
export type StatusListResponse = ApiResponse<TaskState[]>;

// Invite API Types
export type InviteResponse = ApiResponse<Invite>;
export type InviteListResponse = ApiResponse<Invite[]>;

// Tag API Types
export type TagResponse = ApiResponse<Tags>;
export type TagListResponse = ApiResponse<Tags[]>;

// Notification API Types
export type NotificationResponse = ApiResponse<Notification>;
export type NotificationListResponse = ApiResponse<Notification[]>;

// Comment API Types
export type CommentResponse = ApiResponse<Comment>;
export type CommentListResponse = ApiResponse<Comment[]>;

// Event API Types
export type EventResponse = ApiResponse<Event>;
export type EventListResponse = ApiResponse<Event[]>;

// Legacy types for backward compatibility (deprecated)
export interface UserCreateRequest {
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
}

export interface UserUpdateRequest {
  username?: string;
  fullName?: string;
  avatar?: string;
}

export type UserCreateResponse = ApiResponse<User>;
export type UserUpdateResponse = ApiResponse<User>;
export type UserDeleteResponse = ApiResponse<{ id: string }>;

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export type ProjectCreateResponse = ApiResponse<Project>;
export type ProjectUpdateResponse = ApiResponse<Project>;
export type ProjectDeleteResponse = ApiResponse<{ id: string }>;

export type TaskCreateResponse = ApiResponse<Task>;
export type TaskUpdateResponse = ApiResponse<Task>;
export type TaskDeleteResponse = ApiResponse<{ id: string }>;

// export interface TaskStateCreateRequest {
//   name: string;
//   color?: string;
//   order: number;
//   projectId: string;
// }

// export interface TaskStateUpdateRequest {
//   name?: string;
//   color?: string;
//   order?: number;
// }

export interface TaskStateCreateRequest {
  name: string;
  position?: number;
  projectId: string;
}

export interface TaskStateUpdateRequest {
  name?: string;
  position?: number;
}

export type TaskStateResponse = ApiResponse<TaskState>;
export type TaskStateListResponse = PaginatedResponse<TaskState>;
export type TaskStateCreateResponse = ApiResponse<TaskState>;
export type TaskStateUpdateResponse = ApiResponse<TaskState>;
export type TaskStateDeleteResponse = ApiResponse<{ id: string }>;

export interface TagsCreateRequest {
  name: string;
  color?: string;
  projectId: string;
}

export interface TagsUpdateRequest {
  name?: string;
  color?: string;
}

export type TagsResponse = ApiResponse<Tags>;
export type TagsListResponse = PaginatedResponse<Tags>;
export type TagsCreateResponse = ApiResponse<Tags>;
export type TagsUpdateResponse = ApiResponse<Tags>;
export type TagsDeleteResponse = ApiResponse<{ id: string }>;

export interface CommentCreateRequest {
  content: string;
  taskId: string;
  // file?: string;
}

export interface CommentUpdateRequest {
  content: string;
  file?: string;
}

export type CommentCreateResponse = ApiResponse<Comment>;
export type CommentUpdateResponse = ApiResponse<Comment>;
export type CommentDeleteResponse = ApiResponse<{ id: string }>;

export interface AddMemberRequest {
  userId: string;
  role: ProjectRole;
  level?: Level;
  technologies?: string[];
}
export interface AddMemberDto {
  userId: string;
  role: ProjectRole;
  level?: Level;
  technologies?: string[];
}

export interface UpdateMemberRoleRequest {
  role: ProjectRole;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}
export interface UpdateMemberOnProjectDto {
  role?: ProjectRole;
  level?: Level;
  technologies?: string[];
}
export interface UpdateMemberProfileDto {
  level?: Level;
  technologies?: string[];
}

export interface UpdateMemberRoleDto {
  role?: ProjectRole;
  level?: Level;
  technologies?: string[];
}

export type MemberResponse = ApiResponse<UsersOnProject>;
export type MemberListResponse = PaginatedResponse<UsersOnProject>;
export type AddMemberResponse = ApiResponse<UsersOnProject>;
export type UpdateMemberResponse = ApiResponse<UsersOnProject>;
export type RemoveMemberResponse = ApiResponse<{
  userId: string;
  projectId: string;
}>;

export type MarkNotificationReadResponse = ApiResponse<Notification>;

export interface Task {
  id: string;
  name: string;
  description?: string;
  statusId: string;
  deadline?: string;
  actualTime?: number;
  createdAt?: string;
  updatedAt?: string;
  priority?: Priority;
  ownerId?: string;
  tagOnTask?: any[];
  taskState?: TaskState;
  assignees?: Assignee[];
  owner?: Owner;
  complexity?: number;
  estimatedTime?: number;
  parentTaskId?: string;
  position?: number;
  subTasks?: Task[];
}

export interface Status {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  position?: number;
}

export interface Assignee {
  userId: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Owner extends User {}

export interface EmitEvent {
  type: EventType;
  payload: string;
  userId: string;
  taskId?: string;
}

export interface MailEvent {
  to: string;
  subject: string;
  content: string;
}

//Recommendation
export enum RecommendationType {
  TASK_SUGGESTION = "TASK_SUGGESTION",
  PROJECT_OPTIMIZATION = "PROJECT_OPTIMIZATION",
  RESOURCE_ALLOCATION = "RESOURCE_ALLOCATION",
  PRIORITY_ADJUSTMENT = "PRIORITY_ADJUSTMENT",
  DEADLINE_WARNING = "DEADLINE_WARNING",
  SKILL_TRAINING = "SKILL_TRAINING",
  WORKLOAD_BALANCING = "WORKLOAD_BALANCING",
  SPRINT_OPTIMIZATION = "SPRINT_OPTIMIZATION",
}
export enum RecommendationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  MODIFIED = "MODIFIED",
  EXPIRED = "EXPIRED",
}
export enum FeedbackAction {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  MODIFIED = "MODIFIED",
  IGNORED = "IGNORED",
  DEFERRED = "DEFERRED",
}
export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  recommendedData: Record<string, any>; // Json từ Prisma
  reasoning?: string | null;
  confidenceScore: number; // 0-1
  status: RecommendationStatus;
  expiresAt?: string | null; // ISO string
  userId: string;
  projectId?: string | null;
  taskId?: string | null;
  agentExecutionId?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations (có thể được include)
  user?: User;
  project?: Project;
  task?: Task;
  feedback?: RecommendationFeedback[];
}

// Feedback cho Recommendation
export interface RecommendationFeedback {
  id: string;
  recommendationId: string;
  userId: string;
  action: FeedbackAction;
  starRating?: number | null; // 1-5
  comment?: string | null;
  helpfulnessRating?: number | null; // 1-5
  accuracyRating?: number | null; // 1-5
  relevanceRating?: number | null; // 1-5
  timeToFeedback?: number | null; // ms
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: User;
  recommendation?: AIRecommendation;
}

// DTOs - chính xác theo backend
export interface SubmitFeedbackDto {
  action: FeedbackAction;
  starRating?: number; // 1-5
  comment?: string;
  helpfulnessRating?: number; // 1-5
  accuracyRating?: number; // 1-5
  relevanceRating?: number; // 1-5
}

export interface UpdateRecommendationStatusDto {
  status: RecommendationStatus;
}

// Analytics Response Type
export interface FeedbackAnalytics {
  totalRecommendations: number;
  acceptedCount: number;
  rejectedCount: number;
  modifiedCount: number;
  ignoredCount: number;
  deferredCount: number;
  averageStarRating: number;
  averageHelpfulness: number;
  averageAccuracy: number;
  averageRelevance: number;
  feedbackRate: number; // % người dùng phản hồi
}

// API Response Types cho Recommendation
export type RecommendationResponse = ApiResponse<AIRecommendation>;
export type RecommendationListResponse = ApiResponse<AIRecommendation[]>;
export type ExpiringRecommendationsResponse = ApiResponse<AIRecommendation[]>;
export type RecommendationAnalyticsResponse = ApiResponse<FeedbackAnalytics>;
export type SubmitFeedbackResponse = ApiResponse<{ success: true }>;
export type UpdateStatusResponse = ApiResponse<AIRecommendation>;

// ==================== PERFORMANCES & ANALYTICS TYPES ====================

export interface VelocityResponse {
  projectId: string;
  averageVelocity: number;
  standardDeviation: number;
  minimum: number;
  maximum: number;
  trend: "increasing" | "decreasing" | "stable";
  confidenceInterval: {
    low: number;
    high: number;
    confidence: number;
  };
}

export interface BurndownChartPoint {
  date: string; // ISO string
  idealRemaining: number;
  actualRemaining: number;
  completed: number;
}

export interface SprintReport {
  sprintId: string;
  startDate: string;
  endDate: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
  completionPercentage: number;
  velocity: number;
  burndownChart: BurndownChartPoint[];
  health: "healthy" | "at-risk" | "critical";
  metrics: {
    schedulePerformanceIndex: number;
    scopeChangeCount: number;
    blockerCount: number;
  };
}

export interface ProjectHealthReport {
  projectId: string;
  overallHealth: "healthy" | "at-risk" | "critical";
  schedule: {
    status: "on-track" | "at-risk" | "critical";
    schedulePerformanceIndex: number;
  };
  risks: {
    count: number;
    highRiskCount: number;
    materialisationRate: number;
  };
  resources: {
    utilizationRate: number;
    bottlenecks: string[];
  };
  quality: {
    defectRate: number;
    reworkPercentage: number;
  };
}

export interface CompletionForecast {
  projectId: string;
  forecastDate: string;
  probabilityOfCompletion: {
    fifthPercentile: number;
    fiftiethPercentile: number;
    eightyFifthPercentile: number;
  };
  recommendedRiskMitigation: string[];
}

export interface UserPerformance {
  userId: string;
  totalTasksCompleted: number;
  averageCycleTime: number;
  onTimeDeliveryRate: number;
  storyPointsDelivered: number;
  velocityContribution: number;
  focusTimePercentage: number;
  blockerResolutionTime?: number;
  feedbackScore?: number;
}

// AI Analysis Response (có thể là text hoặc structured)
export interface AIAnalysisResponse {
  analysis: string;
  threadId: string;
  executionId: string;
}
//Task AI
export interface AssignTaskDto {
  taskId: string;
  userIds: string[];
}

export interface UpdateTaskStatusDto {
  statusId: string;
}
export interface CreateTaskWithAIDto {
  description: string;
  projectId: string;
  requiredSkills?: string[];
  preferredTimeline?: number;
}
