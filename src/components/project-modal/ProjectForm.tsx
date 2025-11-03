"use client";
import { Stack, TextInput, Textarea, Group, Button, ActionIcon, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconFolder, IconFileText, IconCalendar, IconSparkles, IconX } from "@tabler/icons-react";
import { ProjectForm as ProjectFormType, ProjectFormValues } from "./types";
import { ProjectPreview } from "./ProjectPreview";

interface ProjectFormProps {
  form: ProjectFormType;
  isEditing: boolean;
  isLoading: boolean;
  showGenerative: boolean;
  onSubmit: (values: ProjectFormValues) => void;
  onCancel: () => void;
  onGenerateTasks: () => void;
  onCloseGenerative?: () => void;
}

export function ProjectForm({
  form,
  isEditing,
  isLoading,
  showGenerative,
  onSubmit,
  onCancel,
  onGenerateTasks,
  onCloseGenerative,
}: ProjectFormProps) {
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
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
              title={
                showGenerative
                  ? "Close generative mode"
                  : "Auto-generate project details"
              }
              onClick={showGenerative ? onCloseGenerative : onGenerateTasks}
            >
              {showGenerative ? <IconX size={16} /> : <IconSparkles size={16} />}
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

        {form.values.name && <ProjectPreview values={form.values} />}

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
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
  );
}