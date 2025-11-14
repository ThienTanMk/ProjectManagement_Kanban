"use client";
import { useEffect, useState } from "react";
import { Modal, Stack, Group, Text, Grid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconFolder } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCreateProject, useUpdateProject } from "@/hooks/project";
import {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "@/types/api";
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
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<{
    [taskId: string]: GeneratedSubtask[];
  }>({});
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState<string[]>([]);

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
      setExpandedTaskIds([]);
      setGeneratedSubtasks({});
      setSelectedTaskIds([]);
      setSelectedSubtaskIds([]);
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
    setExpandedTaskIds((prev) => [...prev, taskId]);
  };

  const handleTaskClick = (task: GeneratedTask) => {
    setSelectedTask(task);
  };

  const handleCloseGenerative = () => {
    setShowGenerative(false);
    setGeneratedTasks([]);
    setSelectedTask(null);
    setExpandedTaskIds([]);
    setGeneratedSubtasks({});
  };

  const handleTaskSelect = (taskId: string, checked: boolean) => {
    setSelectedTaskIds((prev) =>
      checked ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  };

  const handleSubtaskSelect = (subtaskId: string, checked: boolean) => {
    setSelectedSubtaskIds((prev) =>
      checked ? [...prev, subtaskId] : prev.filter((id) => id !== subtaskId)
    );
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
  const selectedTasks = generatedTasks.filter((t) =>
    selectedTaskIds.includes(t.id)
  );
  const selectedSubtasks = Object.values(generatedSubtasks)
    .flat()
    .filter((s) => selectedSubtaskIds.includes(s.id));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconFolder size={20} />
          <Text fw={600}>
            {isEditing ? "Edit Project" : "Create Project"}
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
            <ProjectForm
              form={form}
              isEditing={isEditing}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onCancel={onClose}
              onGenerateTasks={handleGenerateTasks}
              onCloseGenerative={handleCloseGenerative}
              showGenerative={true}
              selectedTasks={selectedTasks}
              selectedSubtasks={selectedSubtasks}
            />
          </Grid.Col>

          {/* Cột giữa: Danh sách tasks */}
          <Grid.Col span={selectedTask ? 4 : 8}>
            <GeneratedTasksList
              tasks={generatedTasks}
              selectedTask={selectedTask}
              expandedTaskIds={expandedTaskIds}
              generatedSubtasks={generatedSubtasks}
              selectedTaskIds={selectedTaskIds}
              selectedSubtaskIds={selectedSubtaskIds}
              onTaskClick={handleTaskClick}
              onSubtasksGenerated={handleSubtasksGenerated}
              onTaskSelect={handleTaskSelect}
              onSubtaskSelect={handleSubtaskSelect}
              onExpandedTaskIdsChange={setExpandedTaskIds}
              onClose={handleCloseGenerative}
            />
          </Grid.Col>

          {/* Cột phải: Chi tiết task được chọn */}
          {selectedTask && (
            <Grid.Col span={4}>
              <TaskDetailPanel
                task={selectedTask}
                subtasks={generatedSubtasks[selectedTask.id]}
                selectedTaskIds={selectedTaskIds}
                selectedSubtaskIds={selectedSubtaskIds}
                onTaskSelect={handleTaskSelect}
                onSubtaskSelect={handleSubtaskSelect}
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
