"use client";
import { Stack, Paper, Group, Avatar, Text } from "@mantine/core";
import dayjs from "dayjs";
import { Event } from "@/types/api";
import { useGetEventByTaskId } from "@/hooks/event";

interface HistorySectionProps {
  taskId: string;
}

export function HistorySection({ taskId }: HistorySectionProps) {
  const { data: events } = useGetEventByTaskId(taskId);

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  return (
    <Stack gap="sm">
      {events && events.length > 0 ? (
        events.map((entry: Event) => (
          <Paper key={entry.id} p="md" withBorder>
            <Group gap="sm" align="flex-start">
              <Avatar size="sm" radius="xl" src={entry.user?.avatar}>
                {entry.user?.name[0]}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      {entry.user?.name || "Unknown User"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDate(entry.createdAt)}
                    </Text>
                  </Group>
                </Group>
                <Text size="sm">{entry.description}</Text>
              </div>
            </Group>
          </Paper>
        ))
      ) : (
        <Text ta="center" c="dimmed" py="xl">
          No history yet
        </Text>
      )}
    </Stack>
  );
}