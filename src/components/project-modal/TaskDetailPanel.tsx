"use client";
import {
  Paper,
  Group,
  Text,
  ActionIcon,
  ScrollArea,
  Stack,
  Badge,
  Button,
  Divider,
  TextInput,
  Textarea,
  MultiSelect,
  NumberInput,
  Modal,
  Grid,
  Select,
  Checkbox,
} from "@mantine/core";
import { IconX, IconClock, IconCalendar, IconEdit, IconCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import { GeneratedTask } from "../agent/GenerativeTaskModal";
import GenerativeSubtask, {
  GeneratedSubtask,
} from "../agent/GenerativeSubtask";
import { Priority } from "@/types/api";
import { getPriorityColor } from "@/lib/utils";

interface TaskDetailPanelProps {
  task: GeneratedTask;
  subtasks?: GeneratedSubtask[];
  selectedTaskIds: string[];
  selectedSubtaskIds: string[];
  onTaskSelect: (taskId: string, checked: boolean) => void;
  onSubtaskSelect: (subtaskId: string, checked: boolean) => void;
  onClose: () => void;
}

export function TaskDetailPanel({
  task,
  subtasks,
  selectedTaskIds,
  selectedSubtaskIds,
  onTaskSelect,
  onSubtaskSelect,
  onClose,
}: TaskDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<GeneratedTask>(task);
  const [assignees, setAssignees] = useState<string[]>([]);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Checkbox
            checked={selectedTaskIds.includes(task.id)}
            onChange={(e) => onTaskSelect(task.id, e.currentTarget.checked)}
          />
          <Text fw={600} size="lg">
            Task Details
          </Text>
        </Group>
        <Group gap="xs">
          {isEditing && (
            <ActionIcon
              onClick={handleSave}
              color="green"
              size="sm"
              title="Save changes"
            >
              <IconCheck size={16} />
            </ActionIcon>
          )}
          <ActionIcon
            onClick={isEditing ? handleCancel : onClose}
            color="gray"
            size="sm"
            title={isEditing ? "Cancel" : "Close"}
          >
            <IconX size={16} />
          </ActionIcon>
          {!isEditing && (
            <ActionIcon
              onClick={() => setIsEditing(true)}
              color="blue"
              size="sm"
              variant="light"
              title="Edit task"
            >
              <IconEdit size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>

      <ScrollArea h={600}>
        <Stack gap="md">
          {/* Task Name */}
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Task Name
            </Text>
            {isEditing ? (
              <TextInput
                placeholder="Enter task name"
                value={editedTask.name}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, name: e.currentTarget.value })
                }
              />
            ) : (
              <Text fw={600} size="md">
                {editedTask.name}
              </Text>
            )}
          </div>

          <Divider />

          {/* Description */}
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Description
            </Text>
            {isEditing ? (
              <Textarea
                placeholder="Enter description"
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    description: e.currentTarget.value,
                  })
                }
                minRows={3}
              />
            ) : (
              <Text size="sm">{editedTask.description}</Text>
            )}
          </div>

          <Divider />

          {/* Priority */}
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Priority
            </Text>
            {isEditing ? (
              <Select
                placeholder="Select priority"
                value={editedTask.priority}
                onChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    priority: (value as Priority) || Priority.MEDIUM,
                  })
                }
                data={[
                  { value: Priority.HIGH, label: "High" },
                  { value: Priority.MEDIUM, label: "Medium" },
                  { value: Priority.LOW, label: "Low" },
                ]}
                searchable
                clearable
              />
            ) : (
              <Badge
                color={getPriorityColor(editedTask.priority)}
                variant="light"
                size="lg"
              >
                {editedTask.priority}
              </Badge>
            )}
          </div>

          <Divider />

          {/* Estimated Time */}
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Estimated Time (hours)
            </Text>
            {isEditing ? (
              <NumberInput
                placeholder="Enter hours"
                value={editedTask.estimatedTime}
                onChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    estimatedTime: value as number,
                  })
                }
                min={0}
              />
            ) : (
              <Group gap="xs">
                <IconClock size={16} />
                <Text size="sm" fw={500}>
                  {editedTask.estimatedTime} hours
                </Text>
              </Group>
            )}
          </div>

          <Divider />

          {/* Deadline */}
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Deadline
            </Text>
            {isEditing ? (
              <TextInput
                type="date"
                value={dayjs(editedTask.deadline).format("YYYY-MM-DD")}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    deadline: dayjs(e.currentTarget.value).toISOString(),
                  })
                }
              />
            ) : (
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text size="sm" fw={500}>
                  {dayjs(editedTask.deadline).format("MMMM DD, YYYY")}
                </Text>
              </Group>
            )}
          </div>

          <Divider />

          {/* Assignees */}
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Assigned To
            </Text>
            {isEditing ? (
              <MultiSelect
                placeholder="Select assignees"
                value={assignees}
                onChange={setAssignees}
                data={[
                  { value: "user1", label: "User 1" },
                  { value: "user2", label: "User 2" },
                  { value: "user3", label: "User 3" },
                ]}
                searchable
                clearable
              />
            ) : (
              <Text size="sm" c={assignees.length === 0 ? "dimmed" : "inherit"}>
                {assignees.length > 0 ? assignees.join(", ") : "Not assigned"}
              </Text>
            )}
          </div>

          <Divider />

          {/* Subtasks */}
          {subtasks && (
            <div>
              <Text size="xs" c="dimmed" mb={8}>
                Subtasks ({subtasks.length})
              </Text>
              <GenerativeSubtask
                taskId={editedTask.id}
                taskName={editedTask.name}
                existingSubtasks={subtasks}
                showGenerateButton={false}
                compact={false}
                selectedSubtaskIds={selectedSubtaskIds}
                onSubtaskSelect={onSubtaskSelect}
              />
            </div>
          )}

          {isEditing && (
            <Button fullWidth mt="md" variant="light">
              Add to Project
            </Button>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}