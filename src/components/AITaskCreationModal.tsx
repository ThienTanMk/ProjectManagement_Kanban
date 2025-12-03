"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Textarea,
  Button,
  Group,
  Text,
  Paper,
  Badge,
  ThemeIcon,
  Loader,
  Alert,
  Divider,
  Box,
  Progress,
  Timeline,
} from "@mantine/core";
import {
  IconSparkles,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSend,
  IconClock,
} from "@tabler/icons-react";
import {
  useCreateTaskWithAI,
  useAITaskCreationStatus,
  useDeleteTask,
} from "@/hooks/task";
import { useProjectStore } from "@/stores/projectStore";
import { notifications } from "@mantine/notifications";
import AgentFeedback from "./agent/AgentFeedback";

interface AITaskCreationModalProps {
  opened: boolean;
  onClose: () => void;
}

interface TaskPreview {
  id: string;
  name: string;
  description: string;
  priority: string;
  estimatedTime?: number;
  complexity?: number;
}

export default function AITaskCreationModal({
  opened,
  onClose,
}: AITaskCreationModalProps) {
  const [description, setDescription] = useState("");
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [taskPreviews, setTaskPreviews] = useState<TaskPreview[]>([]);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [feedbackModalOpened, setFeedbackModalOpened] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState<"accept" | "reject">(
    "accept"
  );

  const { currentProjectId } = useProjectStore();
  const createTaskWithAI = useCreateTaskWithAI();
  const deleteTask = useDeleteTask();

  const { data: statusData, isLoading: isPolling } = useAITaskCreationStatus(
    executionId,
    !!executionId
  );

  useEffect(() => {
    if (statusData?.status === "COMPLETED" && statusData.tasks) {
      const previews = statusData.tasks
        .filter((t: { id?: string; name?: string }) => t.id && t.name)
        .map((task) => ({
          id: task.id!,
          name: task.name!,
          description: task.description || "",
          priority: task.priority || "MEDIUM",
          estimatedTime: task.estimatedTime,
          complexity: task.complexity,
        }));
      setTaskPreviews(previews);
      setRecommendationId(statusData.aIRecommendationId || null);

      notifications.show({
        title: "Tasks Generated! 🎉",
        message: `AI created ${previews.length} task(s) for you`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } else if (statusData?.status === "FAILED") {
      notifications.show({
        title: "Generation Failed",
        message: statusData.error || "Failed to generate tasks with AI",
        color: "red",
        icon: <IconX size={16} />,
      });
      setExecutionId(null);
    }
  }, [statusData]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      notifications.show({
        title: "Description Required",
        message: "Please enter a task description",
        color: "orange",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    if (!currentProjectId) {
      notifications.show({
        title: "No Project Selected",
        message: "Please select a project first",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    try {
      const response = await createTaskWithAI.mutateAsync({
        projectId: currentProjectId,
        description: description.trim(),
      });

      setExecutionId(response.executionId);

      notifications.show({
        title: "AI Processing Started",
        message: response.message || "AI is generating tasks...",
        color: "blue",
        icon: <IconClock size={16} />,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to start AI task generation";
      notifications.show({
        title: "Failed to Start",
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleAccept = () => {
    setFeedbackAction("accept");
    setFeedbackModalOpened(true);
  };

  const handleReject = async () => {
    try {
      for (const task of taskPreviews) {
        await deleteTask.mutateAsync(task.id);
      }

      notifications.show({
        title: "Tasks Rejected",
        message: "All generated tasks have been deleted",
        color: "blue",
        icon: <IconCheck size={16} />,
      });

      setFeedbackAction("reject");
      setFeedbackModalOpened(true);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to delete some tasks",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleFeedbackSubmit = () => {
    handleClose();
  };

  const handleClose = () => {
    setDescription("");
    setTaskPreviews([]);
    setExecutionId(null);
    setRecommendationId(null);
    onClose();
  };

  const isGenerating =
    !!executionId &&
    (statusData?.status === "PENDING" ||
      statusData?.status === "RUNNING" ||
      isPolling);
  const progress = statusData?.progress || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Group gap="sm">
            <ThemeIcon color="violet" variant="light" size="lg" radius="xl">
              <IconSparkles size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700}>Create Tasks with AI</Text>
              <Text size="xs" c="dimmed">
                Describe what you need and let AI create tasks for you
              </Text>
            </div>
          </Group>
        }
        size="lg"
        centered
        closeOnClickOutside={!isGenerating}
      >
        <Stack gap="lg">
          {taskPreviews.length === 0 ? (
            <>
              <Textarea
                label="Task Description"
                placeholder="E.g., Create a user authentication system with login, registration, and password reset features"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                disabled={isGenerating}
                leftSection={<IconSparkles size={16} />}
              />

              {isGenerating && (
                <Paper p="md" withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" fw={600}>
                        AI is generating tasks...
                      </Text>
                      <Badge color="blue" variant="light">
                        {statusData?.status || "PENDING"}
                      </Badge>
                    </Group>

                    <Progress
                      value={progress}
                      size="lg"
                      color={progress === 100 ? "green" : "blue"}
                      animated={progress < 100}
                    />

                    <Text size="xs" c="dimmed">
                      Progress: {progress}%
                    </Text>

                    {statusData?.steps && statusData.steps.length > 0 && (
                      <Timeline
                        active={statusData.steps.length - 1}
                        bulletSize={24}
                        lineWidth={2}
                      >
                        {statusData.steps.map((step, index) => (
                          <Timeline.Item
                            key={index}
                            title={step.name}
                            bullet={
                              step.status === "COMPLETED" ? (
                                <IconCheck size={12} />
                              ) : (
                                <Loader size={12} />
                              )
                            }
                          >
                            <Text size="xs" c="dimmed">
                              {step.status}{" "}
                              {step.duration ? `(${step.duration}ms)` : ""}
                            </Text>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    )}
                  </Stack>
                </Paper>
              )}

              <Button
                fullWidth
                leftSection={
                  isGenerating ? <Loader size="xs" /> : <IconSend size={16} />
                }
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={isGenerating}
                color="violet"
                size="md"
              >
                {isGenerating
                  ? "Generating Tasks..."
                  : "Generate Tasks with AI"}
              </Button>

              <Alert
                icon={<IconSparkles size={16} />}
                color="blue"
                variant="light"
              >
                <Text size="sm">
                  💡 Tip: Be specific about requirements, features, and
                  priorities for better results
                </Text>
              </Alert>
            </>
          ) : (
            <>
              <Box>
                <Text size="sm" fw={600} mb="xs">
                  Preview Generated Tasks
                </Text>
                <Stack gap="sm">
                  {taskPreviews.map((task, index) => (
                    <Paper
                      key={task.id}
                      p="md"
                      withBorder
                      radius="md"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--monday-border-primary)",
                      }}
                    >
                      <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                          <Badge size="sm" color="violet">
                            Task {index + 1}
                          </Badge>
                          <Badge
                            size="sm"
                            color={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                        </Group>
                        {task.estimatedTime && (
                          <Text size="xs" c="dimmed">
                            ~{task.estimatedTime}h
                          </Text>
                        )}
                      </Group>
                      <Text fw={600} mb="xs">
                        {task.name}
                      </Text>
                      {task.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {task.description}
                        </Text>
                      )}
                      {task.complexity && (
                        <Group gap="xs" mt="xs">
                          <Text size="xs" c="dimmed">
                            Complexity:
                          </Text>
                          <Badge size="xs" variant="outline">
                            {task.complexity}/5
                          </Badge>
                        </Group>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Divider />

              <Group justify="space-between">
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconX size={16} />}
                  onClick={handleReject}
                >
                  Reject & Delete
                </Button>
                <Button
                  color="green"
                  leftSection={<IconCheck size={16} />}
                  onClick={handleAccept}
                >
                  Accept Tasks
                </Button>
              </Group>

              <Alert
                icon={<IconAlertCircle size={16} />}
                color="blue"
                variant="light"
              >
                <Text size="xs">
                  After accepting or rejecting, you&apos;ll be asked to provide
                  feedback to help improve AI suggestions
                </Text>
              </Alert>
            </>
          )}
        </Stack>
      </Modal>

      {feedbackModalOpened && recommendationId && (
        <AgentFeedback
          opened={feedbackModalOpened}
          onClose={() => {
            setFeedbackModalOpened(false);
            handleClose();
          }}
          suggestion={{
            id: recommendationId,
            type: "task",
            content: `Generated ${taskPreviews.length} task(s) from: "${description}"`,
            context: feedbackAction,
          }}
          onSubmitFeedback={handleFeedbackSubmit}
        />
      )}
    </>
  );
}
