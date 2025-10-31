"use client";
import { Text, Badge, Group, Button, Avatar } from "@mantine/core";
import {
  IconClock,
  IconUser,
  IconUsers,
  IconBinaryTree,
  IconEdit,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Task } from "@/types/api";

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

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  return (
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
          <Badge color={getPriorityColor(task.priority)} variant="light">
            {task.priority}
          </Badge>
        )}
        <Badge color="blue" variant="outline">
          {task.status?.name}
        </Badge>
        {task.deadline && (
          <Badge variant="light" leftSection={<IconClock size={15} />}>
            Due: {formatDate(task.deadline)}
          </Badge>
        )}
        {task.actualTime !== undefined && task.actualTime > 0 && (
          <Badge variant="light" color="blue">
            {task.actualTime}h spent
          </Badge>
        )}
        {task.createdAt && (
          <Badge variant="light" leftSection={<IconClock size={12} />}>
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

      <Group justify="end" mt="md">
        <Button
          leftSection={<IconBinaryTree size={16} />}
          onClick={onToggleSubtasks}
        >
          SubTask ({subtasks.length})
        </Button>
        <Button leftSection={<IconEdit size={16} />} onClick={onEdit}>
          Edit Task
        </Button>
      </Group>
    </>
  );
}