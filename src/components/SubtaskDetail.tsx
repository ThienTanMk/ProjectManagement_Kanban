"use client";
import { Stack, Group, Text, Badge, Paper, Tooltip } from "@mantine/core";
import { IconClock, IconCornerDownRight, IconSubtask } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Task } from "@/types/api";
import { getPriorityColor } from "@/lib/utils";

interface SubtaskTreeProps {
  subtasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function SubtaskTree({
  subtasks,
  onTaskClick,
}: SubtaskTreeProps) {
  return (
    <Stack gap="sm">
      {subtasks.length > 0 ? (
        subtasks.map((task, index) => {
          const isSubtask = !!task.parentTaskId;

          return (
            <Paper
              key={task.id}
              shadow="xs"
              p="md"
              withBorder
              style={{
                cursor: "pointer",
                backgroundColor: isSubtask
                  ? "var(--monday-bg-tertiary)"
                  : "var(--monday-bg-card)",
                borderLeft: isSubtask
                  ? "3px solid var(--monday-primary)"
                  : undefined,
                borderColor: "var(--monday-border-primary)",
                color: "var(--monday-text-primary)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--monday-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor
                  ? "var(--monday-bg-tertiary)"
                  : "var(--monday-bg-card)";
              }}
              onClick={() => onTaskClick(task)}
            >
              <Group justify="space-between" wrap="nowrap">
                <IconSubtask size={18} color="var(--monday-primary)" />
                <div style={{ flex: 1 }}>
                  <Text fw={500} size="sm" mb={4}>
                    {task.name}
                  </Text>
                  {task.description && (
                    <Text size="xs" lineClamp={1}>
                      {task.description}
                    </Text>
                  )}
                </div>

                <Group gap="xs" wrap="nowrap">
                  <Badge color={getPriorityColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>

                  {task.deadline && (
                    <Tooltip
                      label={`Deadline: ${dayjs(task.deadline).format(
                        "MMM D, YYYY"
                      )}`}
                    >
                      <Group gap={4}>
                        <IconClock size={14} />
                        <Text size="xs" c="dimmed">
                          {dayjs(task.deadline).format("MMM D")}
                        </Text>
                      </Group>
                    </Tooltip>
                  )}

                  {task.actualTime && task.actualTime > 0 && (
                    <Badge variant="light" color="blue" size="sm">
                      {task.actualTime}h
                    </Badge>
                  )}
                </Group>
              </Group>
            </Paper>
          );
        })
      ) : (
        <Text ta="center" c="dimmed" py="xl">
          No subtasks available
        </Text>
      )}
    </Stack>
  );
}
