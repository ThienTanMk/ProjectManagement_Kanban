"use client";
import { Paper, Group, Text, ActionIcon } from "@mantine/core";
import { IconBinaryTree, IconSparkles, IconX } from "@tabler/icons-react";
import { Task } from "@/types/api";
import SubtaskTree from "../SubtaskDetail";
import { generateSubtasksForTask, GeneratedSubtask } from "../GenerativeSubtask";

interface SubtasksPanelProps {
  task: Task;
  subtasks: Task[];
  onToggleSubtasks: () => void;
  onSubtasksGenerated: (taskId: string, subtasks: GeneratedSubtask[]) => void;
}

export function SubtasksPanel({
  task,
  subtasks,
  onToggleSubtasks,
  onSubtasksGenerated,
}: SubtasksPanelProps) {
  const handleGenerateSubtasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!task) return;
    const generatedSubtasks = generateSubtasksForTask(task.id, task.name);
    onSubtasksGenerated(task.id, generatedSubtasks);
  };

  return (
    <Paper
      p="md"
      withBorder
      h="100%"
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconBinaryTree size={20} color="#228be6" />
          <Text fw={600} size="lg">
            Subtasks ({subtasks.length})
          </Text>
        </Group>
        <Group>
          <ActionIcon color="blue" onClick={handleGenerateSubtasks}>
            <IconSparkles size={16} />
          </ActionIcon>
          <ActionIcon onClick={onToggleSubtasks} color="gray">
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <SubtaskTree subtasks={subtasks} onTaskClick={(subtask) => {}} />
    </Paper>
  );
}