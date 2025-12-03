"use client";
import { Stack, Paper, Group, Avatar, Text, Badge } from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Event } from "@/types/api";
import { useGetEventByTaskId } from "@/hooks/event";
import { formatTime, getNotificationColor } from "@/lib/utils";

dayjs.extend(relativeTime);

interface HistorySectionProps {
  taskId: string;
}

export function HistorySection({ taskId }: HistorySectionProps) {
  const { data: events } = useGetEventByTaskId(taskId);

  const getEventMessage = (event: Event) => {
    const userName = event.user?.name || "Someone";
    const taskName = event.task?.name || "this task";

    let payload: any = {};
    try {
      if (event.payload && event.payload !== "") {
        payload =
          typeof event.payload === "string"
            ? JSON.parse(event.payload)
            : event.payload;
      }
    } catch (err) {
      console.error("Failed to parse payload:", err);
    }

    const tagName = payload?.tagName || "a tag";
    const subtaskName = payload?.subtaskName || "a subtask";
    const assigneeName = payload?.assigneeName || "someone";
    const newStatus = payload?.newStatus || "a new status";
    const oldStatus = payload?.oldStatus || "previous status";

    switch (event.type) {
      case "TASK_CREATED":
        return `${userName} created task "${taskName}"`;
      case "TASK_UPDATED":
        return `${userName} updated task "${taskName}"`;
      case "TASK_DELETED":
        return `${userName} deleted task "${taskName}"`;
      case "COMMENT_ADDED":
        return `${userName} added a comment`;
      case "COMMENT_UPDATED":
        return `${userName} updated a comment`;
      case "COMMENT_DELETED":
        return `${userName} deleted a comment`;
      case "TASK_STATUS_UPDATED":
        return `${userName} moved task from ${oldStatus} to ${newStatus}`;
      case "ASSIGNEE_ADDED":
        return `${userName} assigned ${assigneeName}`;
      case "ASSIGNEE_REMOVED":
        return `${userName} removed ${assigneeName}`;
      case "TAG_ADDED":
        return `${userName} added tag "${tagName}"`;
      case "TAG_REMOVED":
        return `${userName} removed tag "${tagName}"`;
      case "SUBTASK_ADDED":
        return `${userName} added subtask "${subtaskName}"`;
      case "SUBTASK_REMOVED":
        return `${userName} removed subtask "${subtaskName}"`;
      case "TASK_PRIORITY_UPDATED":
        return `${userName} changed priority to ${
          payload?.newPriority || "N/A"
        }`;
      case "TASK_DEADLINE_UPDATED":
        return `${userName} updated the deadline`;
      case "TASK_DESCRIPTION_UPDATED":
        return `${userName} updated the description`;
      default:
        return `${userName} performed an action`;
    }
  };

  return (
    <Stack gap="sm">
      {events && events.length > 0 ? (
        events.map((entry: Event) => (
          <Paper
            key={entry.id}
            p="md"
            withBorder
            style={{
              backgroundColor: "var(--monday-bg-card)",
            }}
          >
            <Group gap="sm" align="flex-start">
              <Avatar size="md" radius="xl" src={entry.user?.avatar}>
                {entry.user?.name?.[0] || "?"}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Group justify="space-between" align="flex-start" mb={4}>
                  <Text size="sm" fw={500} style={{ lineHeight: 1.2 }}>
                    {entry.type.replace(/_/g, " ")}
                  </Text>
                  <Badge
                    size="sm"
                    color={getNotificationColor(entry.type)}
                    variant="dot"
                  />
                </Group>

                <Text size="sm" mb={4}>
                  {getEventMessage(entry)}
                </Text>

                <Text size="xs" c="dimmed">
                  {formatTime(entry.createdAt.toString())}
                </Text>
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
