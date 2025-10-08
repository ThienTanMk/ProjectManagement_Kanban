import { useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Group,
  Button,
  Box,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconFolder, IconFileText } from "@tabler/icons-react";
import { useCreateProject, useUpdateProject } from "../hooks/project";
import {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "../types/api";
import dayjs from "dayjs";
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
    }
  }, [opened, project, isEditing]);
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
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {}
          <TextInput
            label="Project Name"
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
                backgroundColor: "var(--mantine-color-gray-0)",
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
    </Modal>
  );
};
export default ProjectModal;
