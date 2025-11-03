"use client";
import { Paper, Group, Text, ActionIcon, ScrollArea, Stack, Box, Badge, Button } from "@mantine/core";
import { IconSparkles, IconX, IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import { GeneratedTask } from "../GenerativeTaskModal";
import GenerativeSubtask, {
  GeneratedSubtask,
  generateSubtasksForTask,
  getPriorityColor,
} from "../GenerativeSubtask";

interface GeneratedTasksListProps {
  tasks: GeneratedTask[];
  selectedTask: GeneratedTask | null;
  expandedTaskId: string | null;
  generatedSubtasks: { [taskId: string]: GeneratedSubtask[] };
  onTaskClick: (task: GeneratedTask) => void;
  onSubtasksGenerated: (taskId: string, subtasks: GeneratedSubtask[]) => void;
  onClose: () => void;
}

export function GeneratedTasksList({
  tasks,
  selectedTask,
  expandedTaskId,
  generatedSubtasks,
  onTaskClick,
  onSubtasksGenerated,
  onClose,
}: GeneratedTasksListProps) {
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconSparkles size={20} color="#228be6" />
          <Text fw={600} size="lg">
            Generated Tasks ({tasks.length})
          </Text>
        </Group>
        <ActionIcon onClick={onClose} color="gray">
          <IconX size={16} />
        </ActionIcon>
      </Group>

      <ScrollArea h={600}>
        <Stack gap="sm">
          {tasks.map((task) => (
            <Box key={task.id}>
              <Paper
                p="md"
                withBorder
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedTask?.id === task.id
                      ? "var(--mantine-color-blue-9)"
                      : "var(--monday-bg-card)",
                  borderColor:
                    selectedTask?.id === task.id
                      ? "var(--mantine-color-blue-5)"
                      : "var(--mantine-color-gray-3)",
                }}
                onClick={() => onTaskClick(task)}
              >
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Text fw={600} size="sm" mb={4}>
                      {task.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
                      {task.description}
                    </Text>
                    <Group gap="xs">
                      <Badge
                        size="sm"
                        color={getPriorityColor(task.priority)}
                        variant="light"
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        size="sm"
                        variant="light"
                        leftSection={<IconClock size={12} />}
                      >
                        {task.estimatedTime}h
                      </Badge>
                      <Badge size="sm" variant="light" color="gray">
                        {dayjs(task.deadline).format("MMM DD")}
                      </Badge>
                    </Group>
                  </Box>
                </Group>
              </Paper>

              {/* Hiển thị subtasks đã generate */}
              {expandedTaskId === task.id && (
                <GenerativeSubtask
                  taskId={task.id}
                  taskName={task.name}
                  existingSubtasks={generatedSubtasks[task.id]}
                  showGenerateButton={false}
                  compact={true}
                />
              )}

              {/* Button generate subtasks */}
              {!generatedSubtasks[task.id] && (
                <Box mt="xs" ml="md">
                  <Button
                    size="xs"
                    variant="light"
                    color="violet"
                    leftSection={<IconSparkles size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const subtasks = generateSubtasksForTask(
                        task.id,
                        task.name
                      );
                      onSubtasksGenerated(task.id, subtasks);
                    }}
                  >
                    Subtasks
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}