"use client";
import { Paper, Group, Text, ActionIcon } from "@mantine/core";
import {
  IconBinaryTree,
  IconPlus,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { Task } from "@/types/api";
import SubtaskTree from "../SubtaskDetail";
import {
  generateSubtasksForTask,
  GeneratedSubtask,
} from "../agent/GenerativeSubtask";
import { useState } from "react";
import { TaskAddSubtask } from "./TaskAddSubtask";

interface SubtasksPanelProps {
  task: Task;
  subtasks: Task[];
  onToggleSubtasks: () => void;
  onSubtasksGenerated: (taskId: string, subtasks: GeneratedSubtask[]) => void;
  onViewSubtask?: (subtask: Task) => void;
}

export function SubtasksPanel({
  task,
  subtasks,
  onToggleSubtasks,
  onSubtasksGenerated,
  onViewSubtask,
}: SubtasksPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const handleAddSubtask = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
  };

  if (showAddForm) {
    return (
      <TaskAddSubtask
        parentTaskId={task.id}
        onClose={handleCloseAddForm}
        onSuccess={handleAddSuccess}
      />
    );
  }
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconBinaryTree size={20} color="#228be6" />
          <Text fw={600} size="lg">
            Subtasks ({subtasks.length})
          </Text>
        </Group>
        <Group>
          <ActionIcon color="blue" onClick={handleAddSubtask}>
            <IconPlus size={16} />
          </ActionIcon>
          <ActionIcon onClick={onToggleSubtasks} color="gray">
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <SubtaskTree
        subtasks={subtasks}
        onTaskClick={(subtask) => {
          if (onViewSubtask) {
            onViewSubtask(subtask);
          }
        }}
      />
    </Paper>
  );
}
