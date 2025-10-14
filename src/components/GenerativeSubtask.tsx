import React from "react";
import {
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconSparkles, IconClock } from "@tabler/icons-react";
import { Priority } from "@/types/api";
import { notifications } from "@mantine/notifications";

export interface GeneratedSubtask {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  estimatedTime: number;
}

interface GenerativeSubtaskProps {
  taskId: string;
  taskName?: string;
  onSubtasksGenerated?: (taskId: string, subtasks: GeneratedSubtask[]) => void;
  existingSubtasks?: GeneratedSubtask[];
  showGenerateButton?: boolean;
  compact?: boolean;
}

// Hàm generate subtasks mockdata
export const generateSubtasksForTask = (taskId: string, taskName?: string): GeneratedSubtask[] => {
  const mockSubtasks: GeneratedSubtask[] = [
    {
      id: `${taskId}-sub-1`,
      name: "Research and Planning",
      description: "Research best practices and plan implementation approach",
      priority: Priority.HIGH,
      estimatedTime: 2,
    },
    {
      id: `${taskId}-sub-2`,
      name: "Core Implementation",
      description: "Implement main functionality and core features",
      priority: Priority.HIGH,
      estimatedTime: 4,
    },
    {
      id: `${taskId}-sub-3`,
      name: "Testing and Validation",
      description: "Write tests and validate functionality",
      priority: Priority.MEDIUM,
      estimatedTime: 2,
    },
    {
      id: `${taskId}-sub-4`,
      name: "Documentation",
      description: "Write technical documentation and user guides",
      priority: Priority.LOW,
      estimatedTime: 1,
    },
  ];

  return mockSubtasks;
};

export const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case Priority.HIGH:
      return "red";
    case Priority.MEDIUM:
      return "yellow";
    case Priority.LOW:
      return "green";
    default:
      return "gray";
  }
};

const GenerativeSubtask: React.FC<GenerativeSubtaskProps> = ({
  taskId,
  taskName,
  onSubtasksGenerated,
  existingSubtasks,
  showGenerateButton = true,
  compact = false,
}) => {
  const [subtasks, setSubtasks] = React.useState<GeneratedSubtask[]>(
    existingSubtasks || []
  );

  const handleGenerate = () => {
    const generated = generateSubtasksForTask(taskId, taskName);
    setSubtasks(generated);
    
    if (onSubtasksGenerated) {
      onSubtasksGenerated(taskId, generated);
    }

    notifications.show({
      title: "✨ Subtasks Generated",
      message: `${generated.length} subtasks generated successfully`,
      color: "green",
    });
  };

  React.useEffect(() => {
    if (existingSubtasks) {
      setSubtasks(existingSubtasks);
    }
  }, [existingSubtasks]);

  if (subtasks.length === 0 && showGenerateButton) {
    return (
      <Box mt="xs">
        <ActionIcon
          color="violet"
          variant="light"
          size="sm"
          onClick={handleGenerate}
        //   title="Generate subtasks"
        >
          <IconSparkles size={14} />
        </ActionIcon>
      </Box>
    );
  }

  if (subtasks.length === 0) {
    return null;
  }

  return (
    <Stack gap={compact ? "xs" : "sm"} mt="xs" ml={compact ? "md" : 0}>
      {subtasks.map((subtask) => (
        <Paper
          key={subtask.id}
          p={compact ? "sm" : "md"}
          withBorder
          style={{
            backgroundColor: compact
              ? "var(--mantine-color-gray-0)"
              : "white",
          }}
        >
          <Text fw={500} size={compact ? "xs" : "sm"} mb={2}>
            {subtask.name}
          </Text>
          <Text
            size="xs"
            c="dimmed"
            lineClamp={compact ? 1 : 2}
            mb={compact ? 4 : 6}
          >
            {subtask.description}
          </Text>
          <Group gap="xs">
            <Badge
              size={compact ? "xs" : "sm"}
              color={getPriorityColor(subtask.priority)}
              variant="light"
            >
              {subtask.priority}
            </Badge>
            <Badge
              size={compact ? "xs" : "sm"}
              variant="light"
              leftSection={<IconClock size={compact ? 10 : 12} />}
            >
              {subtask.estimatedTime}h
            </Badge>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
};

export default GenerativeSubtask;