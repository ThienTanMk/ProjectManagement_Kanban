"use client";
import {
  Paper,
  Group,
  Text,
  ActionIcon,
  ScrollArea,
  Stack,
  Box,
  Badge,
  Button,
  Checkbox,
} from "@mantine/core";
import { IconSparkles, IconX, IconClock, IconUser } from "@tabler/icons-react";
import dayjs from "dayjs";
import { GeneratedTask } from "../GenerativeTaskModal";
import GenerativeSubtask, {
  GeneratedSubtask,
  generateSubtasksForTask,
} from "../GenerativeSubtask";
import { getPriorityColor } from "@/lib/utils";

interface GeneratedTasksListProps {
  tasks: GeneratedTask[];
  selectedTask: GeneratedTask | null;
  expandedTaskIds: string[];
  generatedSubtasks: { [taskId: string]: GeneratedSubtask[] };
  selectedTaskIds: string[];
  selectedSubtaskIds: string[];
  compact?: boolean;
  onTaskClick: (task: GeneratedTask) => void;
  onSubtasksGenerated: (taskId: string, subtasks: GeneratedSubtask[]) => void;
  onTaskSelect: (taskId: string, checked: boolean) => void;
  onSubtaskSelect: (subtaskId: string, checked: boolean) => void;
  onExpandedTaskIdsChange: (taskIds: string[]) => void; 
  onClose: () => void;
}

export function GeneratedTasksList({
  tasks,
  selectedTask,
  expandedTaskIds,
  generatedSubtasks,
  selectedTaskIds,
  selectedSubtaskIds,
  compact = false,
  onTaskClick,
  onSubtasksGenerated,
  onTaskSelect,
  onSubtaskSelect,
  onExpandedTaskIdsChange,
  onClose,
}: GeneratedTasksListProps) {
  const handleToggleSubtasks = (taskId: string) => {
    if (expandedTaskIds.includes(taskId)) {
      // Nếu đã expanded, thì collapse nó
      onExpandedTaskIdsChange(expandedTaskIds.filter((id) => id !== taskId));
    } else {
      // Nếu chưa expanded, thì thêm vào
      onExpandedTaskIdsChange([...expandedTaskIds, taskId]);
    }
  };

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
                      ? "var(--monday-primary-1)"
                      : "var(--monday-bg-card)",
                  borderColor:
                    selectedTask?.id === task.id
                      ? "var(--mantine-color-blue-5)"
                      : "var(--mantine-color-gray-3)",
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm" style={{ flex: 1 }}>
                    <Checkbox
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={(e) =>
                        onTaskSelect(task.id, e.currentTarget.checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Box style={{ flex: 1 }} onClick={() => onTaskClick(task)}>
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
                      {task.assigned && (
                        <Group gap="xs" mt={4}>
                          <IconUser size={compact ? 10 : 12} stroke={1.5} />
                          <Text size="xs" c="dimmed">
                            {Array.isArray(task.assigned)
                              ? task.assigned.join(", ")
                              : task.assigned}
                          </Text>
                        </Group>
                      )}
                    </Box>
                  </Group>
                </Group>
              </Paper>

              {/* Hiển thị subtasks đã generate */}
              {expandedTaskIds.includes(task.id) && (
                <GenerativeSubtask
                  taskId={task.id}
                  taskName={task.name}
                  existingSubtasks={generatedSubtasks[task.id]}
                  showGenerateButton={false}
                  compact={true}
                  selectedSubtaskIds={selectedSubtaskIds}
                  onSubtaskSelect={onSubtaskSelect}
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
                      // Tự động expand khi generate subtasks
                      handleToggleSubtasks(task.id);
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
