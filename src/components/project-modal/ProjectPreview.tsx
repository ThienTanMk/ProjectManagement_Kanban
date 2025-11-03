"use client";
import { Box, Text, Group } from "@mantine/core";
import dayjs from "dayjs";
import { ProjectFormValues } from "./types";

interface ProjectPreviewProps {
  values: ProjectFormValues;
}

export function ProjectPreview({ values }: ProjectPreviewProps) {
  return (
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
        {values.name}
      </Text>
      {values.description && (
        <Text size="xs" mt={4}>
          {values.description}
        </Text>
      )}
      {(values.startDate || values.endDate) && (
        <Group gap="sm" mt="xs">
          {values.startDate && (
            <Text size="xs" >
              Start: {dayjs(values.startDate).format("MMM DD, YYYY")}
            </Text>
          )}
          {values.endDate && (
            <Text size="xs" >
              End: {dayjs(values.endDate).format("MMM DD, YYYY")}
            </Text>
          )}
        </Group>
      )}
    </Box>
  );
}