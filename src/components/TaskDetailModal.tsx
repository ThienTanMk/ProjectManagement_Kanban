"use client";
import { useMemo, useState } from "react";
import {
  Modal,
  Text,
  Badge,
  Stack,
  Group,
  Button,
  Divider,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Avatar,
  Paper,
  ScrollArea,
  MultiSelect,
  NumberInput,
  FileInput,
  Card,
  Collapse,
  Grid,
  Box,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconEdit,
  IconTrash,
  IconSend,
  IconClock,
  IconUser,
  IconX,
  IconDownload,
  IconFile,
  IconUpload,
  IconUsers,
  IconCheck,
  IconSparkles,
  IconBinaryTree,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Task, Comment, Event } from "@/types/api";
import { useGetAvailableUsers } from "@/hooks/user";
import { useGetStatuses } from "@/hooks/status";
import { useGetEventByTaskId } from "@/hooks/event";
import omit from "lodash/omit";
import {
  useAddComment,
  useDeleteComment,
  useGetCommentByTaskId,
  useUpdateComment,
} from "@/hooks/comment";
import { useDeleteTask, useTask, useUpdateTask } from "@/hooks/task";
import { presignUrl, uploadFile } from "@/services/upload";
import SubtaskTree from "./SubtaskDetail";
import GenerativeSubtask, {
  GeneratedSubtask,
  generateSubtasksForTask,
  getPriorityColor,
} from "./GenerativeSubtask";
import { modals } from "@mantine/modals";
dayjs.extend(relativeTime);
interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}
interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  opened: boolean;
}
export default function TaskDetailModal({
  taskId,
  onClose,
  opened,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<
    (Task & { assigneeIds: string[] }) | null
  >(null);
  const [newComment, setNewComment] = useState("");
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<
    "comments" | "history" | "subtasks"
  >("comments");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<{
    [taskId: string]: GeneratedSubtask[];
  }>({});
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const { data: availableUsers } = useGetAvailableUsers();
  const { data: events } = useGetEventByTaskId(taskId);
  const { data: comments } = useGetCommentByTaskId(taskId);
  const { mutateAsync: addComment } = useAddComment(taskId);
  const { mutateAsync: deleteCommentMutation } = useDeleteComment(taskId);
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: updateComment } = useUpdateComment();

  const { data: _task } = useTask(taskId);
  const task = useMemo(() => {
    if (!_task) return null;
    return {
      ..._task,
      assigneeIds: _task?.assignees?.map((a) => a.userId) || [],
    };
  }, [_task]);
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "green";
      default:
        return "gray";
    }
  };
  const { data: statuses } = useGetStatuses();

  // data mẫu
  const subtasks = useMemo(
    () =>
      [
        {
          id: "sub-root-1",
          name: "Backend API Development",
          description: "Create RESTful APIs for user management",
          priority: "HIGH",
          deadline: dayjs().add(3, "day").toISOString(),
          statusId: "todo",
          actualTime: 5,
        },
        {
          id: "sub-child-1",
          name: "Database Schema Design",
          description: "Design database tables and relationships",
          priority: "HIGH",
          deadline: dayjs().add(1, "day").toISOString(),
          statusId: "inprogress",
          actualTime: 3,
        },
        {
          id: "sub-child-2",
          name: "API Endpoint Implementation",
          description: "Implement CRUD operations",
          priority: "MEDIUM",
          deadline: dayjs().add(2, "day").toISOString(),
          statusId: "todo",
          actualTime: 2,
        },
        {
          id: "sub-root-2",
          name: "Frontend UI Components",
          description: "Build reusable React components",
          priority: "MEDIUM",
          deadline: dayjs().add(5, "day").toISOString(),
          statusId: "inprogress",
          actualTime: 4,
          level: 3,
        },
        {
          id: "sub-child-3",
          name: "Component Library Setup",
          description: "Setup Mantine UI component library",
          priority: "LOW",
          deadline: dayjs().add(4, "day").toISOString(),
          statusId: "done",
          actualTime: 1,
        },
        {
          id: "sub-root-3",
          name: "Testing & Quality Assurance",
          description: "Write unit tests and integration tests",
          priority: "LOW",
          deadline: dayjs().add(7, "day").toISOString(),
          statusId: "todo",
          actualTime: 0,
        },
      ] as Task[],
    [taskId]
  );

  const handleSubtaskClick = (subtask: Task) => {
    // onClose();
    modals.open({
      modalId: `subtask-${subtask.id}`,
      title: (
        <Group gap="xs">
          <IconBinaryTree size={20} />
          <Text fw={600}>Task Details</Text>
        </Group>
      ),
      children: (
        <TaskDetailModal
          taskId={subtask.id}
          onClose={() => modals.close(`subtask-${subtask.id}`)}
          opened={true}
        />
      ),
      size: "xl",
      centered: true,
    });
  };

  const handleSubTask = () => {
    setShowSubtasks(!showSubtasks);
  };

  //subtasks generate
  const handleSubtasksGenerated = (
    taskId: string,
    subtasks: GeneratedSubtask[]
  ) => {
    setGeneratedSubtasks((prev) => ({
      ...prev,
      [taskId]: subtasks,
    }));
    setExpandedTaskId(taskId);
  };

  const handleEdit = () => {
    setEditedTask(task);
    setIsEditing(true);
  };
  const handleSaveEdit = async () => {
    console.log("change");
    if (editedTask) {
      setIsUpdating(true);
      try {
        await updateTask({
          id: taskId,
          data: {
            ...omit(editedTask, ["assigneeIds", "ownerId", "owner", "status"]),
            assignees: editedTask.assigneeIds.map((id) => id),
          },
        });

        setIsEditing(false);
        setEditedTask(null);
      } catch (error) {
        console.error("Failed to update task:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTask(null);
  };
  const handleAddComment = async () => {
    if (!newComment.trim() && !commentFile) return;

    setIsAddingComment(true);
    try {
      let fileUrl = null;

      // Upload file first if exists
      if (commentFile) {
        setIsUploadingFile(true);

        // Generate unique filename
        const timestamp = Date.now();
        const extension = commentFile.name.split(".").pop();
        const filename = `comments/${taskId}_${timestamp}.${extension}`;

        // Get presigned URL and upload file
        const { url: presignedUrl, publicUrl } = await presignUrl(filename);
        await uploadFile(commentFile, presignedUrl);

        fileUrl = publicUrl;
        setIsUploadingFile(false);
      }

      // Add comment with file URL
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
    if (!task || !editedCommentText.trim()) return;

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
    if (!task) return;

    try {
      await deleteCommentMutation(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };
  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  console.log("TaskDetailModal taskId:", task);

  if (!taskId || !task) return null;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: "100%" }}>
          <Text fw={600} size="xl">
            Task Details
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              onClick={handleSubTask}
              disabled={isEditing}
            >
              <IconBinaryTree size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              onClick={handleEdit}
              disabled={isEditing}
            >
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={handleDelete}>
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Group>
      }
      size={showSubtasks ? "90vw" : "xl"}
      style={{ maxWidth: "1000px" }}
      className="rounded-xl bg-gray-300"
      centered
    >
      {showSubtasks ? (
        <Grid gutter="md">
          <Grid.Col span={4}>
            <Stack gap="md">
              <div>
                {isEditing ? (
                  <Stack gap="sm">
                    <TextInput
                      label="Title"
                      value={editedTask?.name || ""}
                      onChange={(e) =>
                        setEditedTask(
                          editedTask
                            ? { ...editedTask, name: e.target.value }
                            : null
                        )
                      }
                      size="md"
                    />
                    <Textarea
                      label="Description"
                      value={editedTask?.description || ""}
                      onChange={(e) =>
                        setEditedTask(
                          editedTask
                            ? { ...editedTask, description: e.target.value }
                            : null
                        )
                      }
                      rows={2}
                      size="md"
                    />
                    <Group gap="sm">
                      <Select
                        label="Priority"
                        value={editedTask?.priority || ""}
                        onChange={(value) =>
                          setEditedTask(
                            editedTask
                              ? { ...editedTask, priority: value || "" }
                              : null
                          )
                        }
                        data={[
                          { value: "HIGH", label: "High" },
                          { value: "MEDIUM", label: "Medium" },
                          { value: "LOW", label: "Low" },
                        ]}
                        style={{ flex: 1 }}
                        size="md"
                      />
                      <Select
                        label="Status"
                        value={editedTask?.statusId || ""}
                        onChange={(value) =>
                          setEditedTask(
                            editedTask
                              ? { ...editedTask, statusId: value || "Backlog" }
                              : null
                          )
                        }
                        data={
                          statuses?.map((status) => ({
                            value: status.id,
                            label: status.name,
                          })) || []
                        }
                        style={{ flex: 1 }}
                        size="md"
                      />
                    </Group>
                    <MultiSelect
                      label="Assignees"
                      value={editedTask?.assigneeIds || []}
                      onChange={(value) =>
                        setEditedTask(
                          editedTask
                            ? { ...editedTask, assigneeIds: value }
                            : null
                        )
                      }
                      data={
                        availableUsers?.map((user) => ({
                          value: user.id,
                          label: user.name,
                        })) || []
                      }
                      searchable
                      size="md"
                    />
                    <Select
                      label="Authors"
                      value={editedTask?.ownerId as string}
                      onChange={(value) =>
                        setEditedTask(
                          editedTask
                            ? { ...editedTask, ownerId: value || "" }
                            : null
                        )
                      }
                      data={
                        availableUsers?.map((user) => ({
                          value: user.id,
                          label: user.name,
                        })) || []
                      }
                      searchable
                      disabled
                      description="Authors cannot be modified"
                      size="md"
                    />
                    <Group gap="sm">
                      <DateTimePicker
                        label="Deadline"
                        value={
                          editedTask?.deadline
                            ? dayjs(editedTask.deadline).toDate()
                            : null
                        }
                        onChange={(value) =>
                          setEditedTask(
                            editedTask
                              ? value
                                ? {
                                    ...editedTask,
                                    deadline: dayjs(value).toISOString(),
                                  }
                                : (() => {
                                    const { deadline, ...rest } = editedTask;
                                    return { ...rest, deadline: "" };
                                  })()
                              : null
                          )
                        }
                        clearable
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        label="Actual Time (hours)"
                        value={editedTask?.actualTime || 0}
                        onChange={(value) =>
                          setEditedTask(
                            editedTask
                              ? {
                                  ...editedTask,
                                  actualTime: Number(value) || 0,
                                }
                              : null
                          )
                        }
                        min={0}
                        step={0.5}
                        decimalScale={1}
                        style={{ flex: 1 }}
                      />
                    </Group>
                    <Group gap="sm" justify="end">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit} loading={isUpdating}>
                        Save Changes
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <>
                    <Text size="xl" fw={600} mb="xs">
                      {task.name}
                    </Text>
                    {task.description && (
                      <Text c="dimmed" mb="md">
                        {task.description}
                      </Text>
                    )}
                    <Group gap="sm" mb="md">
                      {task.priority && (
                        <Badge
                          color={getPriorityColor(task.priority)}
                          variant="light"
                        >
                          {task.priority}
                        </Badge>
                      )}
                      <Badge color="blue" variant="outline">
                        {task.status?.name}
                      </Badge>
                      {task.deadline && (
                        <Badge
                          variant="light"
                          leftSection={<IconClock size={15} />}
                        >
                          Due: {formatDate(task.deadline)}
                        </Badge>
                      )}
                      {task.actualTime !== undefined && task.actualTime > 0 && (
                        <Badge variant="light" color="blue">
                          {task.actualTime}h spent
                        </Badge>
                      )}
                      {task.createdAt && (
                        <Badge
                          variant="light"
                          leftSection={<IconClock size={12} />}
                        >
                          Created: {formatDate(task.createdAt)}
                        </Badge>
                      )}
                    </Group>
                    {task.assignees && task.assignees.length > 0 && (
                      <Group gap="xs" mb="md">
                        <IconUser size={16} />
                        <Text size="md" fw={500}>
                          Assignees:
                        </Text>
                        <Avatar.Group spacing="xs">
                          {task.assignees.map((assignee, idx) => (
                            <Badge
                              key={idx}
                              variant="light"
                              color="blue"
                              fz="sm"
                            >
                              {assignee.user.name}
                            </Badge>
                          ))}
                        </Avatar.Group>
                      </Group>
                    )}
                    {task.owner && (
                      <Group gap="xs" mb="md">
                        <IconUsers size={16} />
                        <Text size="md" fw={500}>
                          Authors: {task.owner.name}
                        </Text>
                      </Group>
                    )}
                    <Group justify="end" mt="md">
                      <Button
                        leftSection={<IconBinaryTree size={16} />}
                        onClick={handleSubTask}
                      >
                        SubTask ({subtasks.length})
                      </Button>
                      <Button
                        leftSection={<IconEdit size={16} />}
                        onClick={handleEdit}
                      >
                        Edit Task
                      </Button>
                    </Group>
                  </>
                )}
              </div>
              <Divider />
              <Group gap="sm">
                <Button
                  variant={activeTab === "comments" ? "filled" : "subtle"}
                  size="sm"
                  onClick={() => setActiveTab("comments")}
                >
                  Comments ({comments?.length || 0})
                </Button>
                <Button
                  variant={activeTab === "history" ? "filled" : "subtle"}
                  size="sm"
                  onClick={() => setActiveTab("history")}
                >
                  History ({events?.length || 0})
                </Button>
              </Group>
              <ScrollArea.Autosize mah={300}>
                {activeTab === "comments" && (
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
                              {commentFile.name} (
                              {(commentFile.size / 1024).toFixed(1)}KB)
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
                              <Avatar
                                size="sm"
                                radius="xl"
                                src={comment.user.avatar}
                              >
                                {(
                                  comment.user.name.charAt(0) || "R"
                                ).toUpperCase()}
                              </Avatar>
                              <div style={{ flex: 1 }}>
                                <Group
                                  justify="space-between"
                                  align="flex-start"
                                  mb="xs"
                                >
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
                                        handleEditComment(
                                          comment.id,
                                          comment.content
                                        )
                                      }
                                    >
                                      <IconEdit size={14} />
                                    </ActionIcon>
                                    <ActionIcon
                                      size="sm"
                                      variant="subtle"
                                      color="red"
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                    >
                                      <IconTrash size={14} />
                                    </ActionIcon>
                                  </Group>
                                </Group>
                                {editingCommentId === comment.id ? (
                                  <Stack gap="xs">
                                    <Textarea
                                      value={editedCommentText}
                                      onChange={(e) =>
                                        setEditedCommentText(e.target.value)
                                      }
                                      rows={3}
                                      autoFocus
                                    />
                                    <Group gap="xs" justify="end">
                                      <ActionIcon
                                        size="sm"
                                        variant="filled"
                                        color="green"
                                        onClick={() =>
                                          handleSaveComment(comment.id)
                                        }
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
                                          {comment.file.split("/").pop() ||
                                            "Attached file"}
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
                )}
                {activeTab === "history" && (
                  <Stack gap="sm">
                    {events && events.length > 0 ? (
                      events.map((entry: Event) => (
                        <Paper key={entry.id} p="md" withBorder>
                          <Group gap="sm" align="flex-start">
                            <Avatar
                              size="sm"
                              radius="xl"
                              src={entry.user?.avatar}
                            >
                              {entry.user?.name[0]}
                            </Avatar>
                            <div style={{ flex: 1 }}>
                              <Group
                                justify="space-between"
                                align="flex-start"
                                mb="xs"
                              >
                                <Group gap="xs">
                                  <Text size="sm" fw={500}>
                                    {entry.user?.name || "Unknown User"}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {formatDate(entry.createdAt)}
                                  </Text>
                                </Group>
                              </Group>
                              <Text size="sm">{entry.description}</Text>
                            </div>
                          </Group>
                        </Paper>
                      ))
                    ) : (
                      <Text ta="center" c="dimmed" py="xl">
                        No history yet
                      </Text>
                    )}
                  </Stack>
                )}
              </ScrollArea.Autosize>
              <Divider />
              <Group justify="end">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
          {/*
          <Grid.Col span={6}>
            {/* Bên phải: Panel subtask 
            <Paper
              p="md"
              withBorder
              h="100%"
              style={{ borderLeft: "1px solid #e0e0e0" }}
            >
              <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <IconBinaryTree size={20} color="#228be6" />
                    <Text fw={600} size="lg">
                      Subtasks ({subtasks.length})
                    </Text>
                  </Group>
                  <Group>
                    {/* Gen Subtask Agent 
                    <ActionIcon  color="blue" 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log("🔥 Generate subtasks clicked!", task);
                        if (!task) {
                          console.warn("Task is undefined");
                          return;
                        }
                        const subtasks = generateSubtasksForTask(task.id, task.name);
                        console.log("Generated subtasks:", subtasks);
                        handleSubtasksGenerated(task.id, subtasks);
                      }}>
                      <IconSparkles size={16} />
                    </ActionIcon>
                    <ActionIcon onClick={() => setShowSubtasks(false)} color="gray">
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
              </Group>
              <SubtaskTree
                subtasks={subtasks}
                onTaskClick={handleSubtaskClick}
              />
            </Paper>
          </Grid.Col> */}
          {/* Khi có subtasks generate thì chia layout 2 cột, ngược lại 1 cột */}
          {generatedSubtasks[task.id] ? (
            <>
              {/* Cột trái: subtasks thật của task */}
              <Grid.Col span={4}>
                <Paper
                  p="md"
                  withBorder
                  h="100%"
                  style={{ borderLeft: "1px solid #e0e0e0" }}
                >
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconBinaryTree size={20} color="#228be6" />
                      <Text fw={600} size="lg">
                        Subtasks ({subtasks.length})
                      </Text>
                    </Group>
                    <Group>
                      <ActionIcon
                        color="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!task) return;
                          const subtasks = generateSubtasksForTask(
                            task.id,
                            task.name
                          );
                          handleSubtasksGenerated(task.id, subtasks);
                        }}
                      >
                        <IconSparkles size={16} />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => setShowSubtasks(false)}
                        color="gray"
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <SubtaskTree
                    subtasks={subtasks}
                    onTaskClick={handleSubtaskClick}
                  />
                </Paper>
              </Grid.Col>

              {/* Cột phải: Generated Subtasks */}
              <Grid.Col span={4}>
                <Paper
                  p="md"
                  withBorder
                  h="100%"
                  style={{
                    borderLeft: "1px solid #e0e0e0",
                    backgroundColor: "var(--mantine-color-gray-0)",
                  }}
                >
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="lg" c="blue">
                      Generated Subtasks ({generatedSubtasks[task.id].length})
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => setGeneratedSubtasks({})}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>

                  <ScrollArea h={500}>
                    <Stack gap="xs">
                      {generatedSubtasks[task.id].map((sub) => (
                        <Paper key={sub.id} p="sm" withBorder radius="md">
                          <Text fw={600} size="sm" mb={4}>
                            {sub.name}
                          </Text>
                          <Text size="xs" c="dimmed" mb="xs" lineClamp={2}>
                            {sub.description || "No description"}
                          </Text>
                          <Group gap="xs">
                            <Badge
                              size="xs"
                              color={getPriorityColor(sub.priority)}
                              variant="light"
                            >
                              {sub.priority}
                            </Badge>
                            <Badge
                              size="xs"
                              variant="light"
                              leftSection={<IconClock size={12} />}
                            >
                              {sub.estimatedTime}h
                            </Badge>
                            <Badge size="xs" variant="light" color="gray">
                              {dayjs(sub.deadline).format("MMM DD")}
                            </Badge>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </ScrollArea>
                </Paper>
              </Grid.Col>
            </>
          ) : (
            // Nếu chưa generate thì vẫn như cũ
            <Grid.Col span={6}>
              <Paper
                p="md"
                withBorder
                h="100%"
                style={{ borderLeft: "1px solid #e0e0e0" }}
              >
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <IconBinaryTree size={20} color="#228be6" />
                    <Text fw={600} size="lg">
                      Subtasks ({subtasks.length})
                    </Text>
                  </Group>
                  <Group>
                    <ActionIcon
                      color="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!task) return;
                        const subtasks = generateSubtasksForTask(
                          task.id,
                          task.name
                        );
                        handleSubtasksGenerated(task.id, subtasks);
                      }}
                    >
                      <IconSparkles size={16} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => setShowSubtasks(false)}
                      color="gray"
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <SubtaskTree
                  subtasks={subtasks}
                  onTaskClick={handleSubtaskClick}
                />
              </Paper>
            </Grid.Col>
          )}
        </Grid>
      ) : (
        <Stack gap="md">
          <div>
            {isEditing ? (
              <Stack gap="sm">
                <TextInput
                  label="Title"
                  value={editedTask?.name || ""}
                  onChange={(e) =>
                    setEditedTask(
                      editedTask
                        ? { ...editedTask, name: e.target.value }
                        : null
                    )
                  }
                  size="md"
                />
                <Textarea
                  label="Description"
                  value={editedTask?.description || ""}
                  onChange={(e) =>
                    setEditedTask(
                      editedTask
                        ? { ...editedTask, description: e.target.value }
                        : null
                    )
                  }
                  rows={2}
                  size="md"
                />
                <Group gap="sm">
                  <Select
                    label="Priority"
                    value={editedTask?.priority || ""}
                    onChange={(value) =>
                      setEditedTask(
                        editedTask
                          ? { ...editedTask, priority: value || "" }
                          : null
                      )
                    }
                    data={[
                      { value: "HIGH", label: "High" },
                      { value: "MEDIUM", label: "Medium" },
                      { value: "LOW", label: "Low" },
                    ]}
                    style={{ flex: 1 }}
                    size="md"
                  />
                  <Select
                    label="Status"
                    value={editedTask?.statusId || ""}
                    onChange={(value) =>
                      setEditedTask(
                        editedTask
                          ? { ...editedTask, statusId: value || "Backlog" }
                          : null
                      )
                    }
                    data={
                      statuses?.map((status) => ({
                        value: status.id,
                        label: status.name,
                      })) || []
                    }
                    style={{ flex: 1 }}
                    size="md"
                  />
                </Group>
                <MultiSelect
                  label="Assignees"
                  value={editedTask?.assigneeIds || []}
                  onChange={(value) =>
                    setEditedTask(
                      editedTask ? { ...editedTask, assigneeIds: value } : null
                    )
                  }
                  data={
                    availableUsers?.map((user) => ({
                      value: user.id,
                      label: user.name,
                    })) || []
                  }
                  searchable
                  size="md"
                />
                <Select
                  label="Authors"
                  value={editedTask?.ownerId as string}
                  onChange={(value) =>
                    setEditedTask(
                      editedTask
                        ? { ...editedTask, ownerId: value || "" }
                        : null
                    )
                  }
                  data={
                    availableUsers?.map((user) => ({
                      value: user.id,
                      label: user.name,
                    })) || []
                  }
                  searchable
                  disabled
                  description="Authors cannot be modified"
                  size="md"
                />
                <Group gap="sm">
                  <DateTimePicker
                    label="Deadline"
                    value={
                      editedTask?.deadline
                        ? dayjs(editedTask.deadline).toDate()
                        : null
                    }
                    onChange={(value) =>
                      setEditedTask(
                        editedTask
                          ? value
                            ? {
                                ...editedTask,
                                deadline: dayjs(value).toISOString(),
                              }
                            : (() => {
                                const { deadline, ...rest } = editedTask;
                                return { ...rest, deadline: "" };
                              })()
                          : null
                      )
                    }
                    clearable
                    style={{ flex: 1 }}
                  />
                  <NumberInput
                    label="Actual Time (hours)"
                    value={editedTask?.actualTime || 0}
                    onChange={(value) =>
                      setEditedTask(
                        editedTask
                          ? { ...editedTask, actualTime: Number(value) || 0 }
                          : null
                      )
                    }
                    min={0}
                    step={0.5}
                    decimalScale={1}
                    style={{ flex: 1 }}
                  />
                </Group>

                <Group gap="sm" justify="end">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} loading={isUpdating}>
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            ) : (
              <>
                <Text size="xl" fw={600} mb="xs">
                  {task.name}
                </Text>
                {task.description && (
                  <Text c="dimmed" mb="md">
                    {task.description}
                  </Text>
                )}
                <Group gap="sm" mb="md">
                  {task.priority && (
                    <Badge
                      color={getPriorityColor(task.priority)}
                      variant="light"
                    >
                      {task.priority}
                    </Badge>
                  )}
                  <Badge color="blue" variant="outline">
                    {task.status?.name}
                  </Badge>
                  {task.deadline && (
                    <Badge
                      variant="light"
                      leftSection={<IconClock size={15} />}
                    >
                      Due: {formatDate(task.deadline)}
                    </Badge>
                  )}
                  {task.actualTime !== undefined && task.actualTime > 0 && (
                    <Badge variant="light" color="blue">
                      {task.actualTime}h spent
                    </Badge>
                  )}
                  {task.createdAt && (
                    <Badge
                      variant="light"
                      leftSection={<IconClock size={12} />}
                    >
                      Created: {formatDate(task.createdAt)}
                    </Badge>
                  )}
                </Group>

                {task.assignees && task.assignees.length > 0 && (
                  <Group gap="xs" mb="md">
                    <IconUser size={16} />
                    <Text size="md" fw={500}>
                      Assignees:
                    </Text>
                    <Avatar.Group spacing="xs">
                      {task.assignees.map((assignee, idx) => (
                        <Badge key={idx} variant="light" color="blue" fz="sm">
                          {assignee.user.name}
                        </Badge>
                      ))}
                    </Avatar.Group>
                  </Group>
                )}
                {task.owner && (
                  <Group gap="xs" mb="md">
                    <IconUsers size={16} />
                    <Text size="md" fw={500}>
                      Authors: {task.owner.name}
                    </Text>
                  </Group>
                )}

                {!isEditing && (
                  <Group justify="end" mt="md">
                    <Button
                      leftSection={<IconBinaryTree size={16} />}
                      onClick={handleSubTask}
                    >
                      SubTask ({subtasks.length})
                    </Button>
                    <Button
                      leftSection={<IconEdit size={16} />}
                      onClick={handleEdit}
                    >
                      Edit Task
                    </Button>
                  </Group>
                )}
              </>
            )}
          </div>
          <Divider />

          <Group gap="sm">
            <Button
              variant={activeTab === "comments" ? "filled" : "subtle"}
              size="sm"
              onClick={() => setActiveTab("comments")}
            >
              Comments ({comments?.length || 0})
            </Button>
            <Button
              variant={activeTab === "history" ? "filled" : "subtle"}
              size="sm"
              onClick={() => setActiveTab("history")}
            >
              History ({events?.length || 0})
            </Button>
          </Group>

          <ScrollArea.Autosize mah={300}>
            {activeTab === "comments" && (
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
                          {commentFile.name} (
                          {(commentFile.size / 1024).toFixed(1)}KB)
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
                          <Avatar
                            size="sm"
                            radius="xl"
                            src={comment.user.avatar}
                          >
                            {(comment.user.name.charAt(0) || "R").toUpperCase()}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Group
                              justify="space-between"
                              align="flex-start"
                              mb="xs"
                            >
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
                                    handleEditComment(
                                      comment.id,
                                      comment.content
                                    )
                                  }
                                >
                                  <IconEdit size={14} />
                                </ActionIcon>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="red"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            </Group>
                            {editingCommentId === comment.id ? (
                              <Stack gap="xs">
                                <Textarea
                                  value={editedCommentText}
                                  onChange={(e) =>
                                    setEditedCommentText(e.target.value)
                                  }
                                  rows={3}
                                  autoFocus
                                />
                                <Group gap="xs" justify="end">
                                  <ActionIcon
                                    size="sm"
                                    variant="filled"
                                    color="green"
                                    onClick={() =>
                                      handleSaveComment(comment.id)
                                    }
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
                            {/* File attachment display */}
                            {comment.file && (
                              <Card p="xs" withBorder mt="xs">
                                <Group gap="xs">
                                  <IconFile size={16} />
                                  <div style={{ flex: 1 }}>
                                    <Text size="xs" fw={500}>
                                      {comment.file.split("/").pop() ||
                                        "Attached file"}
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
            )}
            {activeTab === "history" && (
              <Stack gap="sm">
                {events && events.length > 0 ? (
                  events.map((entry: Event) => (
                    <Paper key={entry.id} p="md" withBorder>
                      <Group gap="sm" align="flex-start">
                        <Avatar size="sm" radius="xl" src={entry.user?.avatar}>
                          {entry.user?.name[0]}
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <Group gap="xs" mb="xs">
                            <Text size="sm" fw={500}>
                              {entry.user?.name}
                            </Text>
                            <Text size="sm" c="blue">
                              {entry.type}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatDate(entry.createdAt)}
                            </Text>
                          </Group>
                          {/* {entry.details && (
                          <Text size="xs" c="dimmed">
                            {entry.details}
                          </Text>
                        )} */}
                        </div>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Text ta="center" c="dimmed" py="xl">
                    No history available
                  </Text>
                )}
              </Stack>
            )}
          </ScrollArea.Autosize>
          <Divider />
          <Group justify="end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
