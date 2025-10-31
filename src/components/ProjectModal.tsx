import { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Group,
  Button,
  Box,
  Text,
  ActionIcon,
  Grid,
  Paper,
  ScrollArea,
  Badge,
  Divider,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconFolder,
  IconFileText,
  IconSparkles,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import { useCreateProject, useUpdateProject } from "../hooks/project";
import {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "../types/api";
import dayjs from "dayjs";

import { GeneratedTask, generateTasksForProject } from "./GenerativeTaskModal";
import GenerativeSubtask, {
  GeneratedSubtask,
  generateSubtasksForTask,
  getPriorityColor,
} from "./GenerativeSubtask";

interface ProjectModalProps {
  opened: boolean;
  onClose: () => void;
  project?: Project | null;
}
const ProjectModal: React.FC<ProjectModalProps> = ({
  opened,
  onClose,
  project,
}) => {
  const isEditing = !!project;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  // generative mode
  const [showGenerative, setShowGenerative] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<GeneratedTask | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<{[taskId: string]: GeneratedSubtask[]; }>({});

  const form = useForm<{
    name: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    initialValues: {
      name: "",
      description: "",
      startDate: null,
      endDate: null,
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return "Project name is required";
        if (value.trim().length < 3)
          return "Project name must be at least 3 characters";
        if (value.trim().length > 100)
          return "Project name must be less than 100 characters";
        return null;
      },
      description: (value) => {
        if (value && value.length > 500)
          return "Description must be less than 500 characters";
        return null;
      },
      endDate: (value, values) => {
        if (
          value &&
          values.startDate &&
          dayjs(value).isBefore(dayjs(values.startDate))
        ) {
          return "End date must be after start date";
        }
        return null;
      },
    },
  });
  useEffect(() => {
    if (opened) {
      if (isEditing && project) {
        form.setValues({
          name: project.name,
          description: project.description || "",
          startDate: project.startDate ? new Date(project.startDate) : null,
          endDate: project.endDate ? new Date(project.endDate) : null,
        });
      } else {
        form.reset();
      }
      setShowGenerative(false);
      setGeneratedTasks([]);
      setSelectedTask(null);
      setExpandedTaskId(null);
      setGeneratedSubtasks({});
    }
  }, [opened, project, isEditing]);

  //generate tasks
  const handleGenerateTasks = () => {
    const tasks = generateTasksForProject(form.values.name);
    setGeneratedTasks(tasks);
    setShowGenerative(true);

    notifications.show({
      title: "✨ Tasks Generated",
      message: `${tasks.length} tasks have been generated successfully!`,
      color: "blue",
    });
  };

  //subtasks generate
  const handleSubtasksGenerated = (
    taskId: string,
    subtasks: GeneratedSubtask[]
  ) => {
    setGeneratedSubtasks((prev) => ({
      ...prev,
      [taskId]: subtasks,
    }));
    setExpandedTaskId(taskId);
  };

  const handleTaskClick = (task: GeneratedTask) => {
    setSelectedTask(task);
  };

  const handleCloseGenerative = () => {
    setShowGenerative(false);
    setGeneratedTasks([]);
    setSelectedTask(null);
    setExpandedTaskId(null);
    setGeneratedSubtasks({});
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const requestData = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
      };
      if (isEditing && project) {
        await updateMutation.mutateAsync({
          id: project.id,
          data: requestData as ProjectUpdateRequest,
        });
        notifications.show({
          title: "Success",
          message: "Project updated successfully",
          color: "green",
        });
      } else {
        await createMutation.mutateAsync(requestData as ProjectCreateRequest);
        notifications.show({
          title: "Success",
          message: "Project created successfully",
          color: "green",
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: isEditing
          ? "Failed to update project"
          : "Failed to create project",
        color: "red",
      });
    }
  };
  const isLoading = createMutation.isPending || updateMutation.isPending;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconFolder size={20} />
          <Text fw={600}>
            {isEditing ? "Edit Project" : "Create New Project"}
          </Text>
        </Group>
      }
      size={showGenerative ? "95vw" : "lg"}
      centered
    >
      {showGenerative ? (
        <Grid gutter="md">
          {/* Cột trái: Form tạo project */}
          <Grid.Col span={4}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Text size="sm" fw={600}>
                      Project Name
                    </Text>
                    <Text c="red">*</Text>
                  </div>

                  {form.values.name.trim() && (
                    <ActionIcon
                      color="blue"
                      variant="light"
                      size="sm"
                      radius="xl"
                      title="Close generative mode"
                      onClick={handleCloseGenerative}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  )}
                </div>
                <TextInput
                  placeholder="Enter project name"
                  required
                  leftSection={<IconFolder size={16} />}
                  {...form.getInputProps("name")}
                />

                <Textarea
                  label="Description"
                  placeholder="Enter project description (optional)"
                  rows={3}
                  leftSection={<IconFileText size={16} />}
                  {...form.getInputProps("description")}
                />

                <Group grow>
                  <DateInput
                    label="Start Date"
                    placeholder="Select start date"
                    leftSection={<IconCalendar size={16} />}
                    clearable
                    {...form.getInputProps("startDate")}
                  />
                  <DateInput
                    label="End Date"
                    placeholder="Select end date"
                    leftSection={<IconCalendar size={16} />}
                    clearable
                    minDate={form.values.startDate || undefined}
                    {...form.getInputProps("endDate")}
                  />
                </Group>

                {form.values.name && (
                  <Box
                    p="md"
                    style={{
                      backgroundColor: "var(--monday-bg-card)",
                      borderRadius: "6px",
                      border: "1px solid var(--mantine-color-gray-3)",
                    }}
                  >
                    <Text size="sm" fw={500} mb="xs">
                      Preview:
                    </Text>
                    <Text size="sm" fw={600}>
                      {form.values.name}
                    </Text>
                    {form.values.description && (
                      <Text size="xs" c="dimmed" mt={4}>
                        {form.values.description}
                      </Text>
                    )}
                    {(form.values.startDate || form.values.endDate) && (
                      <Group gap="sm" mt="xs">
                        {form.values.startDate && (
                          <Text size="xs" c="dimmed">
                            Start:{" "}
                            {dayjs(form.values.startDate).format(
                              "MMM DD, YYYY"
                            )}
                          </Text>
                        )}
                        {form.values.endDate && (
                          <Text size="xs" c="dimmed">
                            End:{" "}
                            {dayjs(form.values.endDate).format("MMM DD, YYYY")}
                          </Text>
                        )}
                      </Group>
                    )}
                  </Box>
                )}

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="subtle"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                    leftSection={<IconFolder size={16} />}
                  >
                    {isEditing ? "Update Project" : "Create Project"}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Grid.Col>

          {/* Cột giữa: Danh sách tasks đã generate */}
          <Grid.Col span={selectedTask ? 4 : 8}>
            <Paper p="md" withBorder h="100%">
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <IconSparkles size={20} color="#228be6" />
                  <Text fw={600} size="lg">
                    Generated Tasks ({generatedTasks.length})
                  </Text>
                </Group>
                <ActionIcon onClick={handleCloseGenerative} color="gray">
                  <IconX size={16} />
                </ActionIcon>
              </Group>

              <ScrollArea h={600}>
                <Stack gap="sm">
                  {generatedTasks.map((task) => (
                    <Box key={task.id}>
                      <Paper
                        p="md"
                        withBorder
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedTask?.id === task.id
                              ? "var(--mantine-color-blue-9)"
                              : "var(--monday-bg-card)",
                          borderColor:
                            selectedTask?.id === task.id
                              ? "var(--mantine-color-blue-5)"
                              : "var(--mantine-color-gray-3)",
                        }}
                        onClick={() => handleTaskClick(task)}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Box style={{ flex: 1 }}>
                            <Text fw={600} size="sm" mb={4}>
                              {task.name}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
                              {task.description}
                            </Text>
                            <Group gap="xs">
                              <Badge
                                size="sm"
                                color={getPriorityColor(task.priority)}
                                variant="light"
                              >
                                {task.priority}
                              </Badge>
                              <Badge
                                size="sm"
                                variant="light"
                                leftSection={<IconClock size={12} />}
                              >
                                {task.estimatedTime}h
                              </Badge>
                              <Badge size="sm" variant="light" color="gray">
                                {dayjs(task.deadline).format("MMM DD")}
                              </Badge>
                            </Group>
                          </Box>
                        </Group>
                      </Paper>

                      {/* Sử dụng GenerativeSubtask component */}
                      {expandedTaskId === task.id && (
                        <GenerativeSubtask
                          taskId={task.id}
                          taskName={task.name}
                          existingSubtasks={generatedSubtasks[task.id]}
                          showGenerateButton={false}
                          compact={true}
                        />
                      )}

                      {/* Button để generate subtasks */}
                      {!generatedSubtasks[task.id] && (
                        <Box mt="xs" ml="md">
                          <Button
                            size="xs"
                            variant="light"
                            color="violet"
                            leftSection={<IconSparkles size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              const subtasks = generateSubtasksForTask(
                                task.id,
                                task.name
                              );
                              handleSubtasksGenerated(task.id, subtasks);
                            }}
                          >
                            Subtasks
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </ScrollArea>
            </Paper>
          </Grid.Col>

          {/* Cột phải: Chi tiết task được chọn */}
          {selectedTask && (
            <Grid.Col span={4}>
              <Paper p="md" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="lg">
                    Task Details
                  </Text>
                  <ActionIcon
                    onClick={() => setSelectedTask(null)}
                    color="gray"
                    size="sm"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>

                <ScrollArea h={600}>
                  <Stack gap="md">
                    <div>
                      <Text size="xs" c="dimmed" mb={4}>
                        Task Name
                      </Text>
                      <Text fw={600} size="md">
                        {selectedTask.name}
                      </Text>
                    </div>

                    <Divider />

                    <div>
                      <Text size="xs" c="dimmed" mb={4}>
                        Description
                      </Text>
                      <Text size="sm">{selectedTask.description}</Text>
                    </div>

                    <Divider />

                    <div>
                      <Text size="xs" c="dimmed" mb={4}>
                        Priority
                      </Text>
                      <Badge
                        color={getPriorityColor(selectedTask.priority)}
                        variant="light"
                        size="lg"
                      >
                        {selectedTask.priority}
                      </Badge>
                    </div>

                    <Divider />

                    <div>
                      <Text size="xs" c="dimmed" mb={4}>
                        Estimated Time
                      </Text>
                      <Group gap="xs">
                        <IconClock size={16} />
                        <Text size="sm" fw={500}>
                          {selectedTask.estimatedTime} hours
                        </Text>
                      </Group>
                    </div>

                    <Divider />

                    <div>
                      <Text size="xs" c="dimmed" mb={4}>
                        Deadline
                      </Text>
                      <Group gap="xs">
                        <IconCalendar size={16} />
                        <Text size="sm" fw={500}>
                          {dayjs(selectedTask.deadline).format("MMMM DD, YYYY")}
                        </Text>
                      </Group>
                    </div>

                    <Divider />

                    {/* Hiển thị subtasks */}
                    {generatedSubtasks[selectedTask.id] && (
                      <div>
                        <Text size="xs" c="dimmed" mb={8}>
                          Subtasks ({generatedSubtasks[selectedTask.id].length})
                        </Text>
                        <GenerativeSubtask
                          taskId={selectedTask.id}
                          taskName={selectedTask.name}
                          existingSubtasks={generatedSubtasks[selectedTask.id]}
                          showGenerateButton={false}
                          compact={false}
                        />
                      </div>
                    )}
                    
                    <Button fullWidth mt="md" variant="light">
                      Add to Project
                    </Button>
                  </Stack>
                </ScrollArea>
              </Paper>
            </Grid.Col>
          )}
        </Grid>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {}
            {/* <TextInput
            label="Project Name"
            placeholder="Enter project name"
            required
            leftSection={<IconFolder size={16} />}
            {...form.getInputProps("name")}
          /> */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Text size="sm" fw={600}>
                  Project Name
                </Text>
                <Text c="red">*</Text>
              </div>

              {form.values.name.trim() && (
                <ActionIcon
                  color="blue"
                  variant="light"
                  size="sm"
                  radius="xl"
                  title="Auto-generate project details"
                  onClick={handleGenerateTasks}
                >
                  <IconSparkles size={16} />
                </ActionIcon>
              )}
            </div>
            <TextInput
              placeholder="Enter project name"
              required
              leftSection={<IconFolder size={16} />}
              {...form.getInputProps("name")}
            />
            {}
            <Textarea
              label="Description"
              placeholder="Enter project description (optional)"
              rows={3}
              leftSection={<IconFileText size={16} />}
              {...form.getInputProps("description")}
            />
            {}
            <Group grow>
              <DateInput
                label="Start Date"
                placeholder="Select start date"
                leftSection={<IconCalendar size={16} />}
                clearable
                {...form.getInputProps("startDate")}
              />
              <DateInput
                label="End Date"
                placeholder="Select end date"
                leftSection={<IconCalendar size={16} />}
                clearable
                minDate={form.values.startDate || undefined}
                {...form.getInputProps("endDate")}
              />
            </Group>
            {}
            {form.values.name && (
              <Box
                p="md"
                style={{
                  backgroundColor: "var(--mantine-color-gray-10)",
                  borderRadius: "6px",
                  border: "1px solid var(--mantine-color-gray-7)",
                }}
              >
                <Text size="sm" fw={500} mb="xs">
                  Preview:
                </Text>
                <Text size="sm" fw={600}>
                  {form.values.name}
                </Text>
                {form.values.description && (
                  <Text size="xs" c="dimmed" mt={4}>
                    {form.values.description}
                  </Text>
                )}
                {(form.values.startDate || form.values.endDate) && (
                  <Group gap="sm" mt="xs">
                    {form.values.startDate && (
                      <Text size="xs" c="dimmed">
                        Start:{" "}
                        {dayjs(form.values.startDate).format("MMM DD, YYYY")}
                      </Text>
                    )}
                    {form.values.endDate && (
                      <Text size="xs" c="dimmed">
                        End: {dayjs(form.values.endDate).format("MMM DD, YYYY")}
                      </Text>
                    )}
                  </Group>
                )}
              </Box>
            )}
            {}
            <Group justify="flex-end" gap="sm">
              <Button variant="subtle" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                leftSection={<IconFolder size={16} />}
              >
                {isEditing ? "Update Project" : "Create Project"}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
export default ProjectModal;
