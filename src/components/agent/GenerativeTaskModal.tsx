import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Select,
  Stack,
  MultiSelect,
  Text,
  Paper,
  Group,
  ActionIcon,
  ScrollArea,
  Badge,
  Progress,
  Loader,
} from "@mantine/core";
import dayjs from "dayjs";
import { DateTimePicker } from "@mantine/dates";
import { Priority, Task } from "@/types/api";
import { notifications } from "@mantine/notifications";
import { IconSparkles, IconUser } from "@tabler/icons-react";
import { useProjectStore } from "@/stores/projectStore";
import { useCreateTaskWithAI, useAITaskCreationStatus } from "@/hooks/task";
import { getPriorityColor } from "@/lib/utils";

export interface GeneratedTask {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  deadline: string;
  estimatedTime: number;
  assigned?: string[];
}

interface GenerativeTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onPrefer: () => void;
  initialTitle: string;
  initialDescription: string;
  initialPriority: Priority;
  initialAssignees: string[];
  initialDeadline: Date | null;
  projectName?: string;
  compact?: boolean;
  onAIFilled?: (task: Task) => void;
}

export default function GenerativeTaskModal({
  opened,
  onClose,
  onPrefer,
  initialTitle,
  initialDescription,
  initialPriority,
  initialAssignees,
  initialDeadline,
  projectName,
  compact = false,
  onAIFilled,
}: GenerativeTaskModalProps) {
  const { currentProjectId } = useProjectStore();
  const createTaskWithAI = useCreateTaskWithAI();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<Priority>(
    initialPriority || Priority.MEDIUM
  );
  const [assignees, setAssignees] = useState<string[]>(initialAssignees || []);
  const [deadline, setDeadline] = useState<Date | null>(initialDeadline);
  const [selectedTask, setSelectedTask] = useState<GeneratedTask | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);

  const { data: statusData } = useAITaskCreationStatus(
    executionId,
    !!executionId
  );

  useEffect(() => {
    if (statusData?.status === "COMPLETED" && statusData.tasks?.[0]) {
      const firstTask = statusData.tasks[0];
      const gen: GeneratedTask = {
        id: firstTask.id || "",
        name: firstTask.name || "",
        description: firstTask.description || "",
        priority: (firstTask.priority as Priority) || Priority.MEDIUM,
        deadline: "",
        estimatedTime: firstTask.estimatedTime || 0,
        assigned: [],
      };

      setSelectedTask(gen);
      setTitle(gen.name);
      setDescription(gen.description);
      setPriority(gen.priority);
      setDeadline(gen.deadline ? dayjs(gen.deadline).toDate() : null);
      setAssignees(gen.assigned ?? []);

      notifications.show({
        color: "green",
        message:
          "AI đã điền gợi ý vào form. Bạn có thể chỉnh sửa rồi tạo task.",
      });

      setExecutionId(null);
    } else if (statusData?.status === "FAILED") {
      notifications.show({
        color: "red",
        title: "Lỗi",
        message:
          "Không thể tạo gợi ý với AI: " +
          (statusData.error || "Unknown error"),
      });
      setExecutionId(null);
    }
  }, [statusData]);

  const handleGenerateWithAI = async () => {
    if (!currentProjectId) {
      notifications.show({
        color: "red",
        message: "Vui lòng chọn project trước",
      });
      return;
    }

    const desc =
      description.trim() ||
      initialDescription.trim() ||
      `Tạo task cho project${
        projectName ? ` "${projectName}"` : ""
      }. Hãy đề xuất chi tiết name, priority, deadline, estimated time và assignees nếu có thể.`;

    try {
      const response = await createTaskWithAI.mutateAsync({
        description: desc,
        projectId: currentProjectId,
      });

      setExecutionId(response.executionId);
    } catch (error: any) {
      notifications.show({
        color: "red",
        title: "Lỗi",
        message: "Không thể tạo gợi ý với AI: " + error.message,
      });
    }
  };

  useEffect(() => {
    if (opened && initialDescription && !selectedTask === null) {
      handleGenerateWithAI();
    }
  }, [opened, initialDescription]);

  const isGenerating =
    !!executionId &&
    (statusData?.status === "PENDING" || statusData?.status === "RUNNING");
  const progress = statusData?.progress || 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Task with AI"
      size="lg"
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            Nhấn để AI gợi ý toàn bộ thông tin task
          </Text>
          <Button
            size="sm"
            variant="filled"
            color="grape"
            leftSection={
              isGenerating ? <Loader size={16} /> : <IconSparkles size={16} />
            }
            loading={isGenerating}
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
          >
            Generate with AI
          </Button>
        </Group>

        {isGenerating && (
          <Paper p="sm" withBorder style={{ backgroundColor: "#f0f9ff" }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" fw={500}>
                  AI đang phân tích và tạo gợi ý...
                </Text>
                <Badge size="xs" color="blue">
                  {statusData?.status || "PENDING"}
                </Badge>
              </Group>
              <Progress value={progress} size="sm" color="blue" animated />
              <Text size="xs" c="dimmed">
                {progress}%
              </Text>
            </Stack>
          </Paper>
        )}

        <TextInput
          label="Task Title"
          placeholder="AI sẽ gợi ý..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          size="lg"
        />
        <Textarea
          label="Description"
          placeholder="Mô tả chi tiết yêu cầu (AI sẽ dựa vào đây)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
          size="lg"
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(value) =>
            setPriority((value as Priority) || Priority.MEDIUM)
          }
          data={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
          size="lg"
        />
        <MultiSelect
          label="Assignees"
          placeholder="AI có thể gợi ý..."
          value={assignees}
          onChange={setAssignees}
          data={[]}
          searchable
          size="lg"
        />
        <DateTimePicker
          label="Deadline"
          placeholder="AI có thể gợi ý..."
          value={deadline}
          onChange={(value) => setDeadline(value ? new Date(value) : null)}
          clearable
          size="lg"
        />

        {selectedTask && (
          <Paper p="sm" withBorder style={{ backgroundColor: "#f0f9ff" }}>
            <Text size="xs" c="dimmed" mb={4}>
              ✨ Đã điền từ gợi ý AI
            </Text>
            <Text size="sm" fw={500}>
              Estimated time ước tính: {selectedTask.estimatedTime} giờ
            </Text>
          </Paper>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={onPrefer} disabled={!title}>
            Create Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
