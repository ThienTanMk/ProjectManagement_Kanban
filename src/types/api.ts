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
}

export interface StatusTask {
  id: string;
  name: string;
  color: string | null;
  order: number;
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
  taskId: string;
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
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  userId: string;
  eventId: string | null;
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

export enum EventType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_DELETED = "COMMENT_DELETED",
}

export interface UsersOnProject {
  user: User;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId: string;
  role: ProjectRole;
}

// DTOs based on OpenAPI Schema Components
export interface UpdateUserDto {
  name?: string;
  avatar?: string;
}

export interface CreateInviteDto {
  email: string;
  projectId: string;
  role?: ProjectRole;
}

export interface CreateStatusDto {
  name: string;
  color?: string;
  order: number;
  projectId: string;
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

export interface CreateTaskDto
  extends Omit<
    Task,
    "id" | "createdAt" | "updatedAt" | "owner" | "status" | "assignees"
  > {
  assignees: string[];
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export interface UpdateStatusDto {
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

export interface CreateNotificationDto {
  title: string;
  message: string;
  userId: string;
  eventId?: string;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  isRead?: boolean;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
}

export interface UpdateCommentDto {
  content: string;
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
export type StatusResponse = ApiResponse<StatusTask>;
export type StatusListResponse = ApiResponse<StatusTask[]>;

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

export interface StatusTaskCreateRequest {
  name: string;
  color?: string;
  order: number;
  projectId: string;
}

export interface StatusTaskUpdateRequest {
  name?: string;
  color?: string;
  order?: number;
}

export type StatusTaskResponse = ApiResponse<StatusTask>;
export type StatusTaskListResponse = PaginatedResponse<StatusTask>;
export type StatusTaskCreateResponse = ApiResponse<StatusTask>;
export type StatusTaskUpdateResponse = ApiResponse<StatusTask>;
export type StatusTaskDeleteResponse = ApiResponse<{ id: string }>;

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
}

export interface CommentUpdateRequest {
  content: string;
}

export type CommentCreateResponse = ApiResponse<Comment>;
export type CommentUpdateResponse = ApiResponse<Comment>;
export type CommentDeleteResponse = ApiResponse<{ id: string }>;

export interface AddMemberRequest {
  userId: string;
  role: ProjectRole;
}

export interface UpdateMemberRoleRequest {
  role: ProjectRole;
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
  actualTime?: any;
  createdAt?: string;
  updatedAt?: string;
  priority?: string;
  ownerId?: string;
  tagOnTask?: any[];
  status?: Status;
  assignees?: Assignee[];
  owner?: Owner;
  order?: number;
}

export interface Status {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignee {
  userId: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Owner extends User {}
