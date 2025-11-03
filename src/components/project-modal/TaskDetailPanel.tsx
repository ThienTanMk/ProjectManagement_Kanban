"use client";
import { Paper, Group, Text, ActionIcon, ScrollArea, Stack, Badge, Button, Divider } from "@mantine/core";
import { IconX, IconClock, IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import { GeneratedTask } from "../GenerativeTaskModal";
import GenerativeSubtask, {
  GeneratedSubtask,
  getPriorityColor,
} from "../GenerativeSubtask";

interface TaskDetailPanelProps {
  task: GeneratedTask;
  subtasks?: GeneratedSubtask[];
  onClose: () => void;
}

export function TaskDetailPanel({
  task,
  subtasks,
  onClose,
}: TaskDetailPanelProps) {
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          Task Details
        </Text>
        <ActionIcon onClick={onClose} color="gray" size="sm">
          <IconX size={16} />
        </ActionIcon>
      </Group>

      <ScrollArea h={600}>
        <Stack gap="md">
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Task Name
            </Text>
            <Text fw={600} size="md">
              {task.name}
            </Text>
          </div>

          <Divider />

          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Description
            </Text>
            <Text size="sm">{task.description}</Text>
          </div>

          <Divider />

          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Priority
            </Text>
            <Badge
              color={getPriorityColor(task.priority)}
              variant="light"
              size="lg"
            >
              {task.priority}
            </Badge>
          </div>

          <Divider />

          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Estimated Time
            </Text>
            <Group gap="xs">
              <IconClock size={16} />
              <Text size="sm" fw={500}>
                {task.estimatedTime} hours
              </Text>
            </Group>
          </div>

          <Divider />

          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Deadline
            </Text>
            <Group gap="xs">
              <IconCalendar size={16} />
              <Text size="sm" fw={500}>
                {dayjs(task.deadline).format("MMMM DD, YYYY")}
              </Text>
            </Group>
          </div>

          <Divider />

          {/* Hiển thị subtasks */}
          {subtasks && (
            <div>
              <Text size="xs" c="dimmed" mb={8}>
                Subtasks ({subtasks.length})
              </Text>
              <GenerativeSubtask
                taskId={task.id}
                taskName={task.name}
                existingSubtasks={subtasks}
                showGenerateButton={false}
                compact={false}
              />
            </div>
          )}

          <Button fullWidth mt="md" variant="light">
            Add to Project
          </Button>
        </Stack>
      </ScrollArea>
    </Paper>
  );
}