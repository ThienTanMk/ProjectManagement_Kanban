"use client";
import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Select,
  Stack,
  MultiSelect,
  Text,
  ActionIcon,
  Group,
  Paper,
  Badge,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useGetAvailableUsers, useGetMe } from "@/hooks/user";
import { CreateTaskDto, Priority, Task } from "@/types/api";
import { IconSparkles } from "@tabler/icons-react";
import GenerativeTaskModal from "./agent/GenerativeTaskModal";

interface AddTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onAddTask: (task: CreateTaskDto) => void;
  initialDeadline?: Date | null;
}

export default function AddTaskModal({
  opened,
  onClose,
  onAddTask,
  initialDeadline,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);

  const [generativeModalOpened, setGenerativeModalOpened] = useState(false);
  const [isAIFilled, setIsAIFilled] = useState(false);

  const { data: me } = useGetMe();
  const { data: availableUsers } = useGetAvailableUsers();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(Priority.MEDIUM);
    setAssignees([]);
    setDeadline(initialDeadline || null);
    setIsAIFilled(false);
  };

  useEffect(() => {
    if (opened) {
      resetForm();
      if (initialDeadline) {
        setDeadline(initialDeadline);
      }
    }
  }, [opened, initialDeadline]);

  const handleAIFilled = (aiTask: Task) => {
    setTitle(aiTask.name || "");
    setDescription(aiTask.description || "");
    setPriority(aiTask.priority || Priority.MEDIUM);
    setDeadline(aiTask.deadline ? dayjs(aiTask.deadline).toDate() : null);
    setAssignees(aiTask.assignees?.map((a) => a.userId) || []);
    setIsAIFilled(true);
    setGenerativeModalOpened(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAddTask({
      name: title,
      description: description || undefined,
      statusId: "",
      priority,
      assignees,
      deadline: deadline ? dayjs(deadline).toISOString() : undefined,
      estimatedTime: undefined,
    });

    onClose();
  };

  return (
    <>
      <Modal
        opened={opened && !generativeModalOpened}
        onClose={onClose}
        title={
          <Group justify="apart">
            <Text size="xl" fw={700}>
              Add New Task
            </Text>
            {isAIFilled && (
              <Badge
                color="violet"
                variant="filled"
                leftSection={<IconSparkles size={12} />}
              >
                AI Generated
              </Badge>
            )}
          </Group>
        }
        size="lg"
        centered
      >
        <Stack gap="lg">
          {/* Nút bật generative mode */}
          <Group justify="apart">
            <div className="flex items-center gap-1">
              <Text size="lg" fw={600}>
                Task Title
              </Text>
              <Text c="red">*</Text>
            </div>
            {/* 
            <ActionIcon
              variant="light"
              color="violet"
              size="lg"
              radius="xl"
              onClick={() => setGenerativeModalOpened(true)}
              title="Let AI generate task details"
            >
              <IconSparkles size={20} />
            </ActionIcon> */}
          </Group>

          <TextInput
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            size="lg"
          />

          <Textarea
            label="Description"
            placeholder="Describe the task in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={4}
            size="lg"
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(v) => setPriority((v as Priority) || Priority.MEDIUM)}
            data={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
            ]}
            size="lg"
          />

          <MultiSelect
            label="Assignees"
            placeholder="Search and select team members..."
            value={assignees}
            onChange={setAssignees}
            data={
              availableUsers?.map((u) => ({
                value: u.id,
                label: u.name || u.email,
              })) || []
            }
            searchable
            clearable
            size="lg"
          />

          <div>
            <Text size="lg" fw={500} mb="xs">
              Author
            </Text>
            <Text size="sm" c="dimmed">
              {me?.name || me?.email || "You"}
            </Text>
          </div>

          <DateTimePicker
            label="Deadline"
            placeholder="Pick deadline..."
            value={deadline}
            onChange={(value) => setDeadline(value ? new Date(value) : null)}
            clearable
            size="lg"
          />

          {isAIFilled && (
            <Paper p="sm" withBorder bg="violet.0">
              <Group gap="xs">
                <IconSparkles size={16} color="violet" />
                <Text size="sm" c="violet" fw={500}>
                  AI đã giúp bạn điền thông tin task. Bạn có thể chỉnh sửa trước
                  khi tạo.
                </Text>
              </Group>
            </Paper>
          )}

          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!title.trim()}
              color="violet"
            >
              Create Task
            </Button>
          </Group>
        </Stack>
      </Modal>

      <GenerativeTaskModal
        opened={generativeModalOpened}
        onClose={() => setGenerativeModalOpened(false)}
        onPrefer={() => {
          setGenerativeModalOpened(false);
        }}
        initialTitle={title}
        initialDescription={description}
        initialPriority={priority}
        initialAssignees={assignees}
        initialDeadline={deadline}
        onAIFilled={handleAIFilled}
      />
    </>
  );
}
