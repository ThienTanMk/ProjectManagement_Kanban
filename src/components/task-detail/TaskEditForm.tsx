"use client";
import { useState } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Group,
  Button,
  NumberInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { Task } from "@/types/api";
import { useGetAvailableUsers } from "@/hooks/user";
import { useGetStatuses } from "@/hooks/status";
import { useUpdateTask } from "@/hooks/task";
import omit from "lodash/omit";

interface TaskEditFormProps {
  task: Task & { assigneeIds: string[] };
  onCancel: () => void;
  onSuccess: () => void;
}

export function TaskEditForm({ task, onCancel, onSuccess }: TaskEditFormProps) {
  const [editedTask, setEditedTask] = useState(task);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: availableUsers } = useGetAvailableUsers();
  const { data: statuses } = useGetStatuses();
  const { mutateAsync: updateTask } = useUpdateTask();

  const handleSave = async () => {
    if (editedTask) {
      setIsUpdating(true);
      try {
        await updateTask({
          id: task.id,
          data: {
            ...omit(editedTask, ["assigneeIds", "ownerId", "owner", "status"]),
            assignees: editedTask.assigneeIds.map((id) => id),
          },
        });
        onSuccess();
      } catch (error) {
        console.error("Failed to update task:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Stack gap="sm">
      <TextInput
        label="Title"
        value={editedTask?.name || ""}
        onChange={(e) =>
          setEditedTask({ ...editedTask, name: e.target.value })
        }
        size="md"
      />
      <Textarea
        label="Description"
        value={editedTask?.description || ""}
        onChange={(e) =>
          setEditedTask({ ...editedTask, description: e.target.value })
        }
        rows={2}
        size="md"
      />
      <Group gap="sm">
        <Select
          label="Priority"
          value={editedTask?.priority || ""}
          onChange={(value) =>
            setEditedTask({ ...editedTask, priority: value || "" })
          }
          data={[
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
          ]}
          style={{ flex: 1 }}
          size="md"
        />
        <Select
          label="Status"
          value={editedTask?.statusId || ""}
          onChange={(value) =>
            setEditedTask({ ...editedTask, statusId: value || "Backlog" })
          }
          data={
            statuses?.map((status) => ({
              value: status.id,
              label: status.name,
            })) || []
          }
          style={{ flex: 1 }}
          size="md"
        />
      </Group>
      <MultiSelect
        label="Assignees"
        value={editedTask?.assigneeIds || []}
        onChange={(value) => setEditedTask({ ...editedTask, assigneeIds: value })}
        data={
          availableUsers?.map((user) => ({
            value: user.id,
            label: user.name,
          })) || []
        }
        searchable
        size="md"
      />
      <Select
        label="Authors"
        value={editedTask?.ownerId as string}
        onChange={(value) =>
          setEditedTask({ ...editedTask, ownerId: value || "" })
        }
        data={
          availableUsers?.map((user) => ({
            value: user.id,
            label: user.name,
          })) || []
        }
        searchable
        disabled
        description="Authors cannot be modified"
        size="md"
      />
      <Group gap="sm">
        <DateTimePicker
          label="Deadline"
          value={editedTask?.deadline ? dayjs(editedTask.deadline).toDate() : null}
          onChange={(value) =>
            setEditedTask(
              value
                ? { ...editedTask, deadline: dayjs(value).toISOString() }
                : (() => {
                    const { deadline, ...rest } = editedTask;
                    return { ...rest, deadline: "" };
                  })()
            )
          }
          clearable
          style={{ flex: 1 }}
        />
        <NumberInput
          label="Actual Time (hours)"
          value={editedTask?.actualTime || 0}
          onChange={(value) =>
            setEditedTask({ ...editedTask, actualTime: Number(value) || 0 })
          }
          min={0}
          step={0.5}
          decimalScale={1}
          style={{ flex: 1 }}
        />
      </Group>
      <Group gap="sm" justify="end">
        <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={isUpdating}>
          Save Changes
        </Button>
      </Group>
    </Stack>
  );
}