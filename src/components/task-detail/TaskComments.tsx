"use client";
import { useState } from "react";
import {
  Stack,
  Paper,
  Textarea,
  FileInput,
  Group,
  Badge,
  Button,
  Avatar,
  Text,
  ActionIcon,
  Card,
} from "@mantine/core";
import {
  IconUpload,
  IconSend,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconFile,
  IconDownload,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Comment } from "@/types/api";
import {
  useAddComment,
  useDeleteComment,
  useGetCommentByTaskId,
  useUpdateComment,
} from "@/hooks/comment";
import { presignUrl, uploadFile } from "@/services/upload";

interface CommentsSectionProps {
  taskId: string;
}

export function CommentsSection({ taskId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const { data: comments } = useGetCommentByTaskId(taskId);
  const { mutateAsync: addComment } = useAddComment(taskId);
  const { mutateAsync: deleteCommentMutation } = useDeleteComment(taskId);
  const { mutateAsync: updateComment } = useUpdateComment();

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && !commentFile) return;

    setIsAddingComment(true);
    try {
      let fileUrl = null;

      if (commentFile) {
        setIsUploadingFile(true);
        const timestamp = Date.now();
        const extension = commentFile.name.split(".").pop();
        const filename = `comments/${taskId}_${timestamp}.${extension}`;
        const { url: presignedUrl, publicUrl } = await presignUrl(filename);
        await uploadFile(commentFile, presignedUrl);
        fileUrl = publicUrl;
        setIsUploadingFile(false);
      }

      await addComment({
        content: newComment,
        file: fileUrl || undefined,
      });

      setNewComment("");
      setCommentFile(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
      setIsUploadingFile(false);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleSaveComment = async (commentId: string) => {
    if (!editedCommentText.trim()) return;

    try {
      await updateComment({ id: commentId, content: editedCommentText });
      setEditingCommentId(null);
      setEditedCommentText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <FileInput
            placeholder="Attach a file..."
            value={commentFile}
            onChange={setCommentFile}
            leftSection={<IconUpload size={16} />}
            clearable
          />
          {commentFile && (
            <Group gap="xs">
              <Badge variant="light" color="gray">
                {commentFile.name} ({(commentFile.size / 1024).toFixed(1)}KB)
              </Badge>
            </Group>
          )}
          <Group justify="end">
            <Button
              leftSection={<IconSend size={16} />}
              onClick={handleAddComment}
              disabled={
                (!newComment.trim() && !commentFile) ||
                isAddingComment ||
                isUploadingFile
              }
              loading={isAddingComment || isUploadingFile}
              size="sm"
            >
              {isUploadingFile ? "Uploading..." : "Add Comment"}
            </Button>
          </Group>
        </Stack>
      </Paper>

      {comments && comments.length > 0 ? (
        <Stack gap="sm">
          {comments.map((comment: Comment) => (
            <Paper key={comment.id} p="md" withBorder>
              <Group gap="sm" align="flex-start">
                <Avatar size="sm" radius="xl" src={comment.user.avatar}>
                  {(comment.user.name.charAt(0) || "R").toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {comment.user.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(comment.createdAt)}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() =>
                          handleEditComment(comment.id, comment.content)
                        }
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  {editingCommentId === comment.id ? (
                    <Stack gap="xs">
                      <Textarea
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <Group gap="xs" justify="end">
                        <ActionIcon
                          size="sm"
                          variant="filled"
                          color="green"
                          onClick={() => handleSaveComment(comment.id)}
                          disabled={!editedCommentText.trim()}
                        >
                          <IconCheck size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          onClick={handleCancelEditComment}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  ) : (
                    comment.content && (
                      <Text size="sm" mb="xs">
                        {comment.content}
                      </Text>
                    )
                  )}
                  {comment.file && (
                    <Card p="xs" withBorder mt="xs">
                      <Group gap="xs">
                        <IconFile size={16} />
                        <div style={{ flex: 1 }}>
                          <Text size="xs" fw={500}>
                            {comment.file.split("/").pop() || "Attached file"}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Click to download
                          </Text>
                        </div>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          component="a"
                          href={comment.file}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <IconDownload size={14} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  )}
                </div>
              </Group>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Text ta="center" c="dimmed" py="xl">
          No comments yet
        </Text>
      )}
    </Stack>
  );
}