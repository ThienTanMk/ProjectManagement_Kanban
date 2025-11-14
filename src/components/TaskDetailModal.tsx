"use client";
import { useState, useMemo } from "react";
import { Modal, Stack, Group, Divider, Button, Grid, ActionIcon, Text } from "@mantine/core";
import { IconEdit, IconTrash, IconBinaryTree } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTask, useDeleteTask } from "@/hooks/task";
import { useGetSubtasks, } from "@/hooks/task";
import {
  TaskInfo,
  TaskEditForm,
  TaskTabs,
  SubtasksPanel,
  GeneratedSubtasksPanel,
  generateSubtasksForTask,
  type GeneratedSubtask,
} from "./task-detail";

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
  opened: boolean;
}

export default function TaskDetailModal({
  taskId,
  onClose,
  opened,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<{
    [taskId: string]: GeneratedSubtask[];
  }>({});
  const { data: subtasks } = useGetSubtasks(taskId);
  const { data: _task } = useTask(taskId);
  const { mutateAsync: deleteTask } = useDeleteTask();

  const task = useMemo(() => {
    if (!_task) return null;
    return {
      ..._task,
      assigneeIds: _task?.assignees?.map((a) => a.userId) || [],
    };
  }, [_task]);

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);
  const handleSubTask = () => setShowSubtasks(!showSubtasks);

  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleSubtasksGenerated = (
    taskId: string,
    subtasks: GeneratedSubtask[]
  ) => {
    setGeneratedSubtasks((prev) => ({
      ...prev,
      [taskId]: subtasks,
    }));
  };

  if (!taskId || !task) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: "100%" }}>
          <Text fw={600} size="xl">Task Details</Text>
          <Group gap="xs">
            {!task.parentTaskId && (
              <ActionIcon variant="subtle" onClick={handleSubTask}>
                <IconBinaryTree size={18} />
              </ActionIcon>
            )}
            <ActionIcon variant="subtle" onClick={handleEdit} disabled={isEditing}>
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={handleDelete}>
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Group>
      }
      size={showSubtasks ? "90vw" : "xl"}
      style={{ maxWidth: "1000px" }}
      // className="rounded-xl bg-gray-300"
      centered
    >
      {showSubtasks ? (
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: generatedSubtasks[task.id] ? 4 : 6 }}>
            <Stack gap="md">
              {isEditing ? (
                <TaskEditForm
                  task={task}
                  onCancel={handleCancelEdit}
                  onSuccess={() => setIsEditing(false)}
                />
              ) : (
                <TaskInfo
                  task={task}
                  subtasks={subtasks ?? []}
                  onEdit={handleEdit}
                  onToggleSubtasks={handleSubTask}
                />
              )}
              <Divider />
              <TaskTabs taskId={taskId} />
              <Divider />
              <Group justify="end">
                <Button variant="outline" onClick={onClose}>Close</Button>
              </Group>
            </Stack>
          </Grid.Col>

          {generatedSubtasks[task.id] ? (
            <>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <SubtasksPanel
                  task={task}
                  subtasks={subtasks ?? []}
                  onToggleSubtasks={() => setShowSubtasks(false)}
                  onSubtasksGenerated={handleSubtasksGenerated}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <GeneratedSubtasksPanel
                  generatedSubtasks={generatedSubtasks[task.id]}
                  onClose={() => setGeneratedSubtasks({})}
                />
              </Grid.Col>
            </>
          ) : (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <SubtasksPanel
                task={task}
                subtasks={subtasks ?? []}
                onToggleSubtasks={() => setShowSubtasks(false)}
                onSubtasksGenerated={handleSubtasksGenerated}
              />
            </Grid.Col>
          )}
        </Grid>
      ) : (
        <Stack gap="md">
          {isEditing ? (
            <TaskEditForm
              task={task}
              onCancel={handleCancelEdit}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <TaskInfo
              task={task}
              subtasks={subtasks ?? []}
              onEdit={handleEdit}
              onToggleSubtasks={handleSubTask}
            />
          )}
          <Divider />
          <TaskTabs taskId={taskId} />
          <Divider />
          <Group justify="end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}