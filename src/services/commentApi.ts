import { instance } from "./axios";

export async function getCommentByTaskId(taskId: string) {
  const res = await instance.get(`/comments/tasks/${taskId}`);
  return res.data;
}

export async function addComment(
  taskId: string,
  content: string,
  file?: string
) {
  const res = await instance.post(`/comments`, { taskId, content, file });
  return res.data;
}

export async function deleteComment(commentId: string) {
  const res = await instance.delete(`/comments/${commentId}`);
  return res.data;
}
export async function updateComment(
  commentId: string,
  content?: string,
  file?: string
) {
  const res = await instance.patch(`/comments/${commentId}`, { content, file });
  return res.data;
}
