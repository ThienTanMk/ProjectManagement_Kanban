"use client";
import { Stack, Group, Text, Badge, Paper, Tooltip } from "@mantine/core";
import { IconClock, IconCornerDownRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Task } from "@/types/api";

interface SubtaskTreeProps {
  subtasks: Task[];
  onTaskClick: (task: Task) => void;
}

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

export default function SubtaskTree({ subtasks, onTaskClick }: SubtaskTreeProps) {
  
  const getTaskLevel = (task: Task, index: number) => {
    if (task.id.includes('child')) return 1;
    if (task.id.includes('root')) return 0;
    
    return 0; 
  };

  return (
    <Stack gap="sm">
      {subtasks.length > 0 ? (
        subtasks.map((task, index) => {
          const level = getTaskLevel(task, index);
          
          return (
            <Paper
              key={task.id}
              shadow="xs"
              p="md"
              withBorder
              style={{
                cursor: "pointer",
                backgroundColor: level === 0 ?  "var(--monday-bg-tertiary)" :  "var(--monday-bg-card)",
                marginLeft: level * 24,
                borderLeft: level > 0 ? "3px solid var(--monday-primary)" : undefined,
                borderColor: "var(--monday-border-primary)",
                color: "var(--monday-text-primary)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--monday-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =  level === 0
                    ? "var(--monday-bg-tertiary)"
                    : "var(--monday-bg-card)";
              }}
              onClick={() => onTaskClick(task)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" style={{ flex: 1 }}>
                  {/* Icon chỉ định subtask */}
                  {level > 0 && (
                    <IconCornerDownRight size={16} color="var(--monday-primary)" />
                  )}
                  {level === 0 && <div style={{ width: 16 }} />}
                  
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
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <Badge color={getPriorityColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                  
                  {task.deadline && (
                    <Tooltip label={`Deadline: ${dayjs(task.deadline).format("MMM D, YYYY")}`}>
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
