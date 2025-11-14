"use client";
import { Box, Text, Group, Stack, Badge, Divider } from "@mantine/core";
import dayjs from "dayjs";
import { ProjectFormValues } from "./types";
import { GeneratedTask } from "../GenerativeTaskModal";
import { GeneratedSubtask } from "../GenerativeSubtask";
import { getPriorityColor } from "@/lib/utils";

interface ProjectPreviewProps {
  values: ProjectFormValues;
  selectedTasks?: GeneratedTask[];
  selectedSubtasks?: GeneratedSubtask[];
  generatedSubtasks?: { [taskId: string]: GeneratedSubtask[] };
}

export function ProjectPreview({
  values,
  selectedTasks = [],
  selectedSubtasks = [],
  generatedSubtasks = {},
}: ProjectPreviewProps) {
  const hasSelectedItems = selectedTasks.length > 0 || selectedSubtasks.length > 0;

  // Tạo cấu trúc tree: task -> subtasks của task đó
  const taskWithSubtasks = selectedTasks.map((task) => ({
    task,
    subtasks: selectedSubtasks.filter((subtask) =>
      subtask.id.startsWith(task.id)
    ),
  }));

  return (
    <Box
      p="md"
      style={{
        backgroundColor: "var(--mantine-color-gray-10)",
        borderRadius: "6px",
        border: "1px solid var(--mantine-color-gray-7)",
      }}
    >
      <Text size="sm" fw={500} mb="xs">
        Preview:
      </Text>
      <Text size="sm" fw={600}>
        {values.name}
      </Text>
      {values.description && (
        <Text size="xs" mt={4}>
          {values.description}
        </Text>
      )}
      {(values.startDate || values.endDate) && (
        <Group gap="sm" mt="xs">
          {values.startDate && (
            <Text size="xs">
              Start: {dayjs(values.startDate).format("MMM DD, YYYY")}
            </Text>
          )}
          {values.endDate && (
            <Text size="xs">
              End: {dayjs(values.endDate).format("MMM DD, YYYY")}
            </Text>
          )}
        </Group>
      )}

      {/* Selected Tasks & Subtasks */}
      {hasSelectedItems && (
        <>
          <Divider my="md" />
          <Text size="sm" fw={500} mb="xs">
            Selected Items:
          </Text>
          <Stack gap="sm">
            {/* Hiển thị theo cấu trúc Task -> Subtasks */}
            {taskWithSubtasks.map(({ task, subtasks }) => (
              <Box key={task.id}>
                {/* Task */}
                <Box
                  p="xs"
                  style={{
                    borderRadius: "4px",
                    border: "1px solid var(--mantine-color-blue-5)",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                  }}
                >
                  <Group justify="space-between" gap="xs">
                    <Text size="xs" fw={500}>
                      📋 {task.name}
                    </Text>
                    <Group gap="xs">
                      <Badge
                        size="xs"
                        color={getPriorityColor(task.priority)}
                        variant="light"
                      >
                        {task.priority}
                      </Badge>
                      <Badge size="xs" variant="light" color="gray">
                        {dayjs(task.deadline).format("MMM DD")}
                      </Badge>
                    </Group>
                  </Group>
                </Box>

                {/* Subtasks của task này */}
                {subtasks.length > 0 && (
                  <Stack gap="xs" mt="xs" ml="md">
                    {subtasks.map((subtask) => (
                      <Box
                        key={subtask.id}
                        p="xs"
                        style={{
                          borderRadius: "4px",
                          border: "1px solid var(--mantine-color-gray-4)",
                          backgroundColor: "rgba(107, 114, 128, 0.05)",
                        }}
                      >
                        <Group justify="space-between" gap="xs">
                          <Text size="xs" fw={500}>
                            └─ {subtask.name}
                          </Text>
                          <Group gap="xs">
                            <Badge
                              size="xs"
                              color={getPriorityColor(subtask.priority)}
                              variant="light"
                            >
                              {subtask.priority}
                            </Badge>
                          </Group>
                        </Group>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}

            {/* Hiển thị subtasks không thuộc task nào được chọn (nếu có) */}
            {selectedSubtasks
              .filter(
                (subtask) =>
                  !selectedTasks.some((task) =>
                    subtask.id.startsWith(task.id)
                  )
              )
              .map((subtask) => (
                <Box
                  key={subtask.id}
                  p="xs"
                  style={{
                    borderRadius: "4px",
                    border: "1px solid var(--mantine-color-gray-4)",
                  }}
                >
                  <Group justify="space-between" gap="xs">
                    <Text size="xs" fw={500}>
                      └─ {subtask.name}
                    </Text>
                    <Group gap="xs">
                      <Badge
                        size="xs"
                        color={getPriorityColor(subtask.priority)}
                        variant="light"
                      >
                        {subtask.priority}
                      </Badge>
                    </Group>
                  </Group>
                </Box>
              ))}
          </Stack>
        </>
      )}
    </Box>
  );
}