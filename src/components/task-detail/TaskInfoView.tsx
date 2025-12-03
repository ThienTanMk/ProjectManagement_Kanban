"use client";
import { useEffect, useState } from "react";
import {
  Text,
  Badge,
  Group,
  Button,
  Avatar,
  Modal,
  Stack,
  Loader,
  Paper,
  Progress,
  Anchor,
  Tooltip,
  Box,
  Divider,
  Grid,
  Card,
} from "@mantine/core";
import {
  IconClock,
  IconUser,
  IconUsers,
  IconBinaryTree,
  IconEdit,
  IconSparkles,
  IconUserPlus,
  IconCalendar,
  IconBarrierBlock,
  IconTarget,
  IconChartBar,
  IconHash,
  IconInfoCircle,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Task } from "@/types/api";
import { formatDate, getPriorityColor } from "@/lib/utils";
import {
  useBreakDownTask,
  useAssignTaskWithAI,
  useTask,
  useBreakDownStatus,
  useAssignTaskStatus,
} from "@/hooks/task";
import { notifications } from "@mantine/notifications";
import TaskDetailModal from "../TaskDetailModal";
import { FormattedDescription } from "./FormattedDescription";

interface TaskInfoProps {
  task: Task & { assigneeIds: string[] };
  subtasks: Task[];
  onEdit: () => void;
  onToggleSubtasks: () => void;
}

export function TaskInfo({
  task,
  subtasks,
  onEdit,
  onToggleSubtasks,
}: TaskInfoProps) {
  const [breakdownModalOpened, setBreakdownModalOpened] = useState(false);
  const [assignModalOpened, setAssignModalOpened] = useState(false);
  const [breakdownExecutionId, setBreakdownExecutionId] = useState<
    string | null
  >(null);
  const [assignExecutionId, setAssignExecutionId] = useState<string | null>(
    null
  );
  const [parentModalTaskId, setParentModalTaskId] = useState<string | null>(
    null
  );

  const breakDownTask = useBreakDownTask();
  const assignTaskWithAI = useAssignTaskWithAI();
  const { data: parentTask, isLoading: loadingParent } = useTask(
    task.parentTaskId || ""
  );

  const { data: breakdownStatus } = useBreakDownStatus(
    breakdownExecutionId,
    !!breakdownExecutionId
  );

  const { data: assignStatus } = useAssignTaskStatus(
    assignExecutionId,
    !!assignExecutionId
  );

  const handleAIBreakdown = async () => {
    try {
      const result = await breakDownTask.mutateAsync(task.id);

      if (result.executionId) {
        setBreakdownExecutionId(result.executionId);
      }
    } catch (error: any) {
      notifications.show({
        title: "Breakdown Failed",
        message: error?.message || "Failed to start task breakdown",
        color: "red",
      });
      setBreakdownModalOpened(false);
    }
  };

  const handleAIAssign = async () => {
    try {
      const result = await assignTaskWithAI.mutateAsync(task.id);

      if (result.executionId) {
        setAssignExecutionId(result.executionId);
      }
    } catch (error: any) {
      notifications.show({
        title: "Assignment Failed",
        message: error?.message || "Failed to start task assignment",
        color: "red",
      });
      setAssignModalOpened(false);
    }
  };

  useEffect(() => {
    if (!breakdownStatus || !breakdownModalOpened) return;

    if (breakdownStatus?.status === "COMPLETED") {
      notifications.show({
        title: "Breakdown Complete!",
        message: `AI created ${breakdownStatus.subtasksCreated || 0} subtasks`,
        color: "green",
      });
      setBreakdownModalOpened(false);
      setBreakdownExecutionId(null);
    }

    if (breakdownStatus?.status === "ERROR") {
      notifications.show({
        title: "Breakdown Failed",
        message: breakdownStatus.error || "Failed to break down task",
        color: "red",
      });
      setBreakdownModalOpened(false);
      setBreakdownExecutionId(null);
    }
  }, [breakdownStatus, breakdownModalOpened]);

  useEffect(() => {
    if (!assignStatus || !assignModalOpened) return;

    if (assignStatus?.status === "COMPLETED") {
      notifications.show({
        title: "Assignment Complete!",
        message: `AI assigned task to ${
          assignStatus.assignedUsers?.length || 0
        } user(s)`,
        color: "green",
      });
      setAssignModalOpened(false);
      setAssignExecutionId(null);
    }

    if (assignStatus?.status === "ERROR") {
      notifications.show({
        title: "Assignment Failed",
        message: assignStatus.error || "Failed to assign task",
        color: "red",
      });
      setAssignModalOpened(false);
      setAssignExecutionId(null);
    }
  }, [assignStatus, assignModalOpened]);

  const openParentTaskModal = (taskId: string) => {
    setParentModalTaskId(taskId);
  };

  const closeParentModal = () => {
    setParentModalTaskId(null);
  };

  return (
    <>
      <Stack gap="md">
        <Text size="xl" fw={600}>
          {task.name}
        </Text>

        <Group gap="sm">
          {task.priority && (
            <Badge color={getPriorityColor(task.priority)} variant="light">
              {task.priority}
            </Badge>
          )}
          <Badge color="blue" variant="outline">
            {task.taskState?.name}
          </Badge>
          {task.complexity && (
            <Badge
              variant="light"
              color={
                task.complexity === 1
                  ? "green"
                  : task.complexity === 2
                  ? "yellow"
                  : task.complexity === 3
                  ? "orange"
                  : task.complexity === 4
                  ? "red"
                  : "pink"
              }
            >
              Complexity: {task.complexity}/5
            </Badge>
          )}
        </Group>

        {task.description && (
          <Box>
            <Text size="sm" fw={500} mb="xs" c="dimmed">
              Description
            </Text>
            <FormattedDescription description={task.description} />
          </Box>
        )}

        <Divider />

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder p="sm">
              <Group gap="xs">
                <IconTarget size={18} color="#228be6" />
                <Box>
                  <Text size="xs" c="dimmed">
                    Estimated Time
                  </Text>
                  <Text size="md" fw={500}>
                    {task.estimatedTime ? `${task.estimatedTime}h` : "N/A"}
                  </Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder p="sm">
              <Group gap="xs">
                <IconClock size={18} color="#fa5252" />
                <Box>
                  <Text size="xs" c="dimmed">
                    Actual Time
                  </Text>
                  <Text size="md" fw={500}>
                    {task.actualTime ? `${task.actualTime}h` : "0h"}
                  </Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          {task.deadline && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card withBorder p="sm">
                <Group gap="xs">
                  <IconCalendar size={18} color="#fa5252" />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Deadline
                    </Text>
                    <Text size="md" fw={500}>
                      {formatDate(task.deadline)}
                    </Text>
                  </Box>
                </Group>
              </Card>
            </Grid.Col>
          )}

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card withBorder p="sm">
              <Group gap="xs">
                <IconClock size={18} color="#868e96" />
                <Box>
                  <Text size="xs" c="dimmed">
                    Created At
                  </Text>
                  <Text size="md" fw={500}>
                    {task.createdAt ? formatDate(task.createdAt) : "N/A"}
                  </Text>
                </Box>
              </Group>
            </Card>
          </Grid.Col>

          {task.updatedAt && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card withBorder p="sm">
                <Group gap="xs">
                  <IconClock size={18} color="#868e96" />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Last Updated
                    </Text>
                    <Text size="md" fw={500}>
                      {formatDate(task.updatedAt)}
                    </Text>
                  </Box>
                </Group>
              </Card>
            </Grid.Col>
          )}

          {task.position !== undefined && task.position !== null && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card withBorder p="sm">
                <Group gap="xs">
                  <IconHash size={18} color="#7950f2" />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Position
                    </Text>
                    <Text size="md" fw={500}>
                      {task.position}
                    </Text>
                  </Box>
                </Group>
              </Card>
            </Grid.Col>
          )}
        </Grid>

        <Divider />

        {task.assignees && task.assignees.length > 0 && (
          <Box>
            <Group gap="xs" mb="xs">
              <IconUser size={16} />
              <Text size="sm" fw={500}>
                Assignees ({task.assignees.length})
              </Text>
            </Group>
            <Group gap="xs">
              {task.assignees.map((assignee, idx) => (
                <Badge key={idx} variant="light" color="blue" size="lg">
                  {assignee.user.avatar ? (
                    <Group gap="xs">
                      <Avatar src={assignee.user.avatar} size="xs" />
                      {assignee.user.name}
                    </Group>
                  ) : (
                    assignee.user.name
                  )}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        {task.owner && (
          <Box>
            <Group gap="xs" mb="xs">
              <IconUsers size={16} />
              <Text size="sm" fw={500}>
                Task Owner
              </Text>
            </Group>
            <Badge variant="light" color="grape" size="lg">
              {task.owner.avatar ? (
                <Group gap="xs">
                  <Avatar src={task.owner.avatar} size="xs" />
                  {task.owner.name}
                </Group>
              ) : (
                task.owner.name
              )}
            </Badge>
          </Box>
        )}

        {task.parentTaskId && (
          <Box>
            <Group gap="xs" mb="xs" align="center">
              <IconBinaryTree size={16} color="#228be6" />
              <Text size="sm" fw={500}>
                Parent Task
              </Text>
            </Group>
            {loadingParent ? (
              <Badge color="gray" variant="light" size="sm">
                Loading...
              </Badge>
            ) : parentTask ? (
              <Tooltip label="Click to view parent task details">
                <Anchor
                  href="#"
                  size="md"
                  fw={500}
                  c="blue"
                  underline="hover"
                  onClick={(e) => {
                    e.preventDefault();
                    openParentTaskModal(parentTask.id);
                  }}
                >
                  {parentTask.name}
                </Anchor>
              </Tooltip>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">
                (Parent task not found)
              </Text>
            )}
          </Box>
        )}

        {!task.parentTaskId && subtasks && subtasks.length > 0 && (
          <Box>
            <Group gap="xs">
              <IconBinaryTree size={16} />
              <Text size="sm" fw={500}>
                Subtasks: {subtasks.length}
              </Text>
            </Group>
          </Box>
        )}

        {task.tagOnTask && task.tagOnTask.length > 0 && (
          <Box>
            <Text size="sm" fw={500} mb="xs" c="dimmed">
              Tags
            </Text>
            <Group gap="xs">
              {task.tagOnTask.map((tagRelation: any, idx: number) => (
                <Badge
                  key={idx}
                  color={tagRelation.tag?.color || "gray"}
                  variant="light"
                >
                  {tagRelation.tag?.name || "Unknown"}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        {task.estimatedTime && task.actualTime !== undefined && (
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500} c="dimmed">
                Time Progress
              </Text>
              <Text size="sm" fw={500}>
                {task.actualTime}h / {task.estimatedTime}h (
                {Math.round((task.actualTime / task.estimatedTime) * 100)}%)
              </Text>
            </Group>
            <Progress
              value={(task.actualTime / task.estimatedTime) * 100}
              color={
                task.actualTime > task.estimatedTime
                  ? "red"
                  : task.actualTime / task.estimatedTime > 0.8
                  ? "yellow"
                  : "blue"
              }
              size="lg"
            />
          </Box>
        )}

        <Divider />

        <Group justify="end">
          {!task.parentTaskId && (
            <>
              <Button
                leftSection={<IconBinaryTree size={16} />}
                onClick={onToggleSubtasks}
                variant="light"
              >
                SubTask ({subtasks?.length ?? 0})
              </Button>
              <Button
                leftSection={<IconSparkles size={16} />}
                onClick={() => setBreakdownModalOpened(true)}
                variant="light"
                color="violet"
              >
                AI Breakdown
              </Button>
            </>
          )}
          <Button
            leftSection={<IconUserPlus size={16} />}
            onClick={() => setAssignModalOpened(true)}
            variant="light"
            color="grape"
          >
            AI Assign
          </Button>
          <Button leftSection={<IconEdit size={16} />} onClick={onEdit}>
            Edit Task
          </Button>
        </Group>
      </Stack>

      <Modal
        opened={breakdownModalOpened}
        onClose={() => setBreakdownModalOpened(false)}
        title="AI Task Breakdown"
        centered
        zIndex={400}
      >
        <Stack gap="md">
          <Text size="sm">
            AI will analyze "{task.name}" and break it down into logical
            subtasks based on:
          </Text>
          <Stack gap="xs">
            <Text size="sm">• Task complexity and estimated time</Text>
            <Text size="sm">• Description and requirements</Text>
            <Text size="sm">• Best practices for task decomposition</Text>
          </Stack>

          {(breakDownTask.isPending || breakdownExecutionId) && (
            <Paper p="md" withBorder>
              <Stack gap="sm" align="center">
                <Loader size="lg" />
                <Text size="sm" c="dimmed">
                  {breakdownStatus?.status === "RUNNING" ||
                  breakdownStatus?.status === "COMPLETED"
                    ? `AI is analyzing and creating subtasks... (${
                        breakdownStatus?.progress || 0
                      }%)`
                    : "Starting AI analysis..."}
                </Text>
                {breakdownStatus?.subtasksCreated > 0 && (
                  <Text size="sm" fw={500} c="green">
                    Created {breakdownStatus.subtasksCreated} subtasks
                  </Text>
                )}
              </Stack>
            </Paper>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setBreakdownModalOpened(false);
                setBreakdownExecutionId(null);
              }}
              disabled={breakDownTask.isPending || !!breakdownExecutionId}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconSparkles size={16} />}
              onClick={handleAIBreakdown}
              loading={breakDownTask.isPending || !!breakdownExecutionId}
              color="violet"
            >
              Start AI Breakdown
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={assignModalOpened}
        onClose={() => setAssignModalOpened(false)}
        title="AI Task Assignment"
        centered
        zIndex={400}
      >
        <Stack gap="md">
          <Text size="sm">
            AI will analyze "{task.name}" and assign it to the best team
            member(s) based on:
          </Text>
          <Stack gap="xs">
            <Text size="sm">• User skills and expertise</Text>
            <Text size="sm">• Current workload and availability</Text>
            <Text size="sm">• Task complexity and requirements</Text>
          </Stack>

          {(assignTaskWithAI.isPending || assignExecutionId) && (
            <Paper p="md" withBorder>
              <Stack gap="sm" align="center">
                <Loader size="lg" />
                <Text size="sm" c="dimmed">
                  {assignStatus?.status === "RUNNING" ||
                  assignStatus?.status === "COMPLETED"
                    ? `AI is analyzing team members and making assignment... (${
                        assignStatus?.progress || 0
                      }%)`
                    : "Starting AI analysis..."}
                </Text>
                {assignStatus?.assignedUsers &&
                  assignStatus.assignedUsers.length > 0 && (
                    <Text size="sm" fw={500} c="green">
                      Assigned to {assignStatus.assignedUsers.length} user(s)
                    </Text>
                  )}
              </Stack>
            </Paper>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setAssignModalOpened(false);
                setAssignExecutionId(null);
              }}
              disabled={assignTaskWithAI.isPending || !!assignExecutionId}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={handleAIAssign}
              loading={assignTaskWithAI.isPending || !!assignExecutionId}
              color="grape"
            >
              Start AI Assignment
            </Button>
          </Group>
        </Stack>
      </Modal>

      {parentModalTaskId && (
        <TaskDetailModal
          taskId={parentModalTaskId}
          opened={!!parentModalTaskId}
          onClose={closeParentModal}
        />
      )}
    </>
  );
}
