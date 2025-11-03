"use client";
import { useEffect, useState } from "react";
import { Modal, Stack, Group, Text, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconFolder } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCreateProject, useUpdateProject } from "@/hooks/project";
import { Project, ProjectCreateRequest, ProjectUpdateRequest } from "@/types/api";
import { GeneratedTask, generateTasksForProject } from "./GenerativeTaskModal";
import { GeneratedSubtask } from "./GenerativeSubtask";
import {
  ProjectForm,
  ProjectPreview,
  GeneratedTasksList,
  TaskDetailPanel,
  ProjectFormValues,
} from "./project-modal";

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

  const form = useForm<ProjectFormValues>({
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

  const handleSubmit = async (values: ProjectFormValues) => {
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
            <Stack gap="md">
              <ProjectForm
                form={form}
                isEditing={isEditing}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={onClose}
                onGenerateTasks={handleGenerateTasks}
                onCloseGenerative={handleCloseGenerative}
                showGenerative={showGenerative}
              />
            </Stack>
          </Grid.Col>

          {/* Cột giữa: Danh sách tasks đã generate */}
          <Grid.Col span={selectedTask ? 4 : 8}>
            <GeneratedTasksList
              tasks={generatedTasks}
              selectedTask={selectedTask}
              expandedTaskId={expandedTaskId}
              generatedSubtasks={generatedSubtasks}
              onTaskClick={handleTaskClick}
              onSubtasksGenerated={handleSubtasksGenerated}
              onClose={handleCloseGenerative}
            />
          </Grid.Col>

          {/* Cột phải: Chi tiết task được chọn */}
          {selectedTask && (
            <Grid.Col span={4}>
              <TaskDetailPanel
                task={selectedTask}
                subtasks={generatedSubtasks[selectedTask.id]}
                onClose={() => setSelectedTask(null)}
              />
            </Grid.Col>
          )}
        </Grid>
      ) : (
        <ProjectForm
          form={form}
          isEditing={isEditing}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={onClose}
          onGenerateTasks={handleGenerateTasks}
          showGenerative={false}
        />
      )}
    </Modal>
  );
};
export default ProjectModal;