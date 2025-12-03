"use client";
import { useState } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  Button,
  Group,
  Text,
  Paper,
  Divider,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { CreateSubtaskDto, Priority } from "@/types/api";
import { useGetAvailableUsers } from "@/hooks/user";
import { useGetTags } from "@/hooks/tag";
import { useCreateSubtask } from "@/hooks/task";

interface TaskAddSubtaskProps {
  parentTaskId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TaskAddSubtask({
  parentTaskId,
  onClose,
  onSuccess,
}: TaskAddSubtaskProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>(
    undefined
  );
  const [complexity, setComplexity] = useState<number | undefined>(undefined);
  const [tagIds, setTagIds] = useState<string[]>([]);

  const { data: availableUsers } = useGetAvailableUsers();
  const { data: tags } = useGetTags();
  const { mutateAsync: createSubtask, isPending } =
    useCreateSubtask(parentTaskId);

  const handleSubmit = async () => {
    if (!name.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Subtask name is required",
        color: "red",
      });
      return;
    }

    const subtaskData: CreateSubtaskDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      priority,
      assignees: assignees.length > 0 ? assignees : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      estimatedTime,
      complexity,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    };

    try {
      await createSubtask(subtaskData);
      notifications.show({
        title: "Success",
        message: "Subtask created successfully!",
        color: "green",
      });

      // Reset form
      setName("");
      setDescription("");
      setPriority(Priority.MEDIUM);
      setAssignees([]);
      setDeadline(null);
      setEstimatedTime(undefined);
      setComplexity(undefined);
      setTagIds([]);

      onSuccess?.();
      onClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to create subtask. Please try again.",
        color: "red",
      });
      console.error("Failed to create subtask:", error);
    }
  };

  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          Add Subtask
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            color="gray"
            variant="subtle"
            onClick={onClose}
            leftSection={<IconX size={14} />}
          >
            Cancel
          </Button>
        </Group>
      </Group>

      <Divider mb="md" />

      <Stack gap="md">
        <TextInput
          label="Subtask Name"
          placeholder="Enter subtask name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="sm"
        />

        <Textarea
          label="Description"
          placeholder="Enter subtask description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          size="sm"
        />

        <Select
          label="Priority"
          value={priority}
          onChange={(value) =>
            setPriority((value as Priority) || Priority.MEDIUM)
          }
          data={[
            { value: Priority.LOW, label: "Low" },
            { value: Priority.MEDIUM, label: "Medium" },
            { value: Priority.HIGH, label: "High" },
          ]}
          size="sm"
        />

        <MultiSelect
          label="Assignees"
          placeholder="Select assignees (optional)"
          value={assignees}
          onChange={setAssignees}
          data={
            availableUsers?.map((user) => ({
              value: user.id,
              label: user.name,
            })) || []
          }
          searchable
          size="sm"
        />

        <MultiSelect
          label="Tags"
          placeholder="Select tags (optional)"
          value={tagIds}
          onChange={setTagIds}
          data={
            tags?.map((tag) => ({
              value: tag.id,
              label: tag.name,
            })) || []
          }
          searchable
          size="sm"
        />

        <DateTimePicker
          label="Deadline"
          placeholder="Select deadline (optional)"
          value={deadline}
          onChange={(value) => setDeadline(value ? new Date(value) : null)}
          clearable
          size="sm"
        />

        <Group grow>
          <NumberInput
            label="Estimated Time (hours)"
            placeholder="e.g., 5"
            value={estimatedTime}
            onChange={(value) => setEstimatedTime(Number(value) || undefined)}
            min={0}
            step={0.5}
            decimalScale={1}
            size="sm"
          />

          <NumberInput
            label="Complexity (1-10)"
            placeholder="e.g., 5"
            value={complexity}
            onChange={(value) => setComplexity(Number(value) || undefined)}
            min={1}
            max={10}
            size="sm"
          />
        </Group>

        <Group justify="end" mt="md">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            leftSection={<IconCheck size={16} />}
          >
            Create Subtask
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}