import React, { useState } from "react";
import {
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Box,
  TextInput,
  Textarea,
  NumberInput,
  Modal,
  Button,
  Grid,
  Select,
  MultiSelect,
  Checkbox,
} from "@mantine/core";
import {
  IconSparkles,
  IconClock,
  IconEdit,
  IconCheck,
  IconX,
  IconUser,
} from "@tabler/icons-react";
import { Priority } from "@/types/api";
import { notifications } from "@mantine/notifications";
import { getPriorityColor } from "@/lib/utils";

export interface GeneratedSubtask {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  estimatedTime: number;
  assigned?: string[];
}

interface GenerativeSubtaskProps {
  taskId: string;
  taskName?: string;
  onSubtasksGenerated?: (taskId: string, subtasks: GeneratedSubtask[]) => void;
  existingSubtasks?: GeneratedSubtask[];
  showGenerateButton?: boolean;
  compact?: boolean;
  selectedSubtaskIds?: string[];
  onSubtaskSelect?: (subtaskId: string, checked: boolean) => void;
}

// Hàm generate subtasks mockdata
export const generateSubtasksForTask = (
  taskId: string,
  taskName?: string
): GeneratedSubtask[] => {
  const mockSubtasks: GeneratedSubtask[] = [
    {
      id: `${taskId}-sub-1`,
      name: "Research and Planning",
      description: "Analyze requirements and outline detailed implementation steps",
      priority: Priority.HIGH,
      estimatedTime: 2,
      assigned: ["Alice"],
    },
    {
      id: `${taskId}-sub-2`,
      name: "Core Implementation",
      description: "Implement main modules and business logic for the feature",
      priority: Priority.HIGH,
      estimatedTime: 4,
      assigned: ["Bob", "Charlie"],
    },
    {
      id: `${taskId}-sub-3`,
      name: "Testing and Validation",
      description: "Create unit tests, run validations, and fix discovered bugs",
      priority: Priority.MEDIUM,
      estimatedTime: 2,
      assigned: ["Daisy"],
    },
    {
      id: `${taskId}-sub-4`,
      name: "Documentation",
      description: "Write technical documentation and API usage guide",
      priority: Priority.LOW,
      estimatedTime: 1,
      assigned: ["Ethan", "Fiona"],
    },
  ];

  return mockSubtasks;
};

const GenerativeSubtask: React.FC<GenerativeSubtaskProps> = ({
  taskId,
  taskName,
  onSubtasksGenerated,
  existingSubtasks,
  showGenerateButton = true,
  compact = false,
  selectedSubtaskIds = [],
  onSubtaskSelect,
}) => {
  const [subtasks, setSubtasks] = React.useState<GeneratedSubtask[]>(
    existingSubtasks || []
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedSubtask, setEditedSubtask] = useState<GeneratedSubtask | null>(
    null
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

  const handleEdit = (subtask: GeneratedSubtask) => {
    setEditingId(subtask.id);
    setEditedSubtask({ ...subtask });
  };

  const handleSaveEdit = () => {
    if (editedSubtask) {
      setSubtasks(
        subtasks.map((s) => (s.id === editedSubtask.id ? editedSubtask : s))
      );
      setEditingId(null);
      setEditedSubtask(null);
      notifications.show({
        title: "Success",
        message: "Subtask updated",
        color: "green",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedSubtask(null);
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
    <>
      <Stack gap={compact ? "xs" : "sm"} mt="xs" ml={compact ? "md" : 0}>
        {subtasks.map((subtask) => (
          <Paper
            key={subtask.id}
            p={compact ? "sm" : "md"}
            withBorder
            style={{
              backgroundColor: compact
                ? "var(--monday-bg-card)"
                : "var(--monday-bg-card)",
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Group gap="sm" style={{ flex: 1 }}>
                {compact && (
                  <Checkbox
                    checked={selectedSubtaskIds.includes(subtask.id)}
                    onChange={(e) =>
                      onSubtaskSelect?.(subtask.id, e.currentTarget.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Box style={{ flex: 1 }}>
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
                  {subtask.assigned && (
                    <Group gap="xs" mt={4}>
                      <IconUser size={compact ? 10 : 12} stroke={1.5} />
                      <Text size="xs" c="dimmed">
                        {Array.isArray(subtask.assigned)
                          ? subtask.assigned.join(", ")
                          : subtask.assigned}
                      </Text>
                    </Group>
                  )}
                </Box>
              </Group>
              <ActionIcon
                size="sm"
                color="blue"
                variant="light"
                onClick={() => handleEdit(subtask)}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Group>
          </Paper>
        ))}
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={editingId !== null}
        onClose={handleCancelEdit}
        title="Edit Subtask"
        size="md"
      >
        {editedSubtask && (
          <Stack gap="md">
            <TextInput
              label="Name"
              value={editedSubtask.name}
              onChange={(e) =>
                setEditedSubtask({
                  ...editedSubtask,
                  name: e.currentTarget.value,
                })
              }
              placeholder="Subtask name"
            />
            <Textarea
              label="Description"
              value={editedSubtask.description}
              onChange={(e) =>
                setEditedSubtask({
                  ...editedSubtask,
                  description: e.currentTarget.value,
                })
              }
              placeholder="Subtask description"
              minRows={3}
            />
            <Select
              label="Priority"
              placeholder="Select priority"
              value={editedSubtask.priority}
              onChange={(value) =>
                setEditedSubtask({
                  ...editedSubtask,
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
            <NumberInput
              label="Estimated Time (hours)"
              value={editedSubtask.estimatedTime}
              onChange={(value) =>
                setEditedSubtask({
                  ...editedSubtask,
                  estimatedTime: value as number,
                })
              }
              min={0}
            />
            <MultiSelect
              label="Assigned To"
              placeholder="Select assignees"
              value={editedSubtask.assigned || []}
              onChange={(value) =>
                setEditedSubtask({
                  ...editedSubtask,
                  assigned: value,
                })
              }
              data={[
                { value: "user1", label: "User 1" },
                { value: "user2", label: "User 2" },
                { value: "user3", label: "User 3" },
              ]}
              searchable
              clearable
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};

export default GenerativeSubtask;
