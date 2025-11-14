"use client";
import { useState } from "react";
import {
  Menu,
  ActionIcon,
  Text,
  Stack,
  Badge,
  Group,
  Avatar,
  Paper,
  ScrollArea,
  Button,
  Drawer,
  Alert,
  Loader,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBell,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/notification";
import { Notification } from "@/types/api";
import { formatTime, getNotificationColor } from "@/lib/utils";
dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const { data: notifications = [], isLoading, error } = useGetNotifications();
  const { data: unreadCount = 0 } = useGetUnreadCount();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const event = notification.event;
    if (!event) return "No details available";

    try {
      const payload =
        typeof event.payload === "string"
          ? JSON.parse(event.payload)
          : event.payload;

      const userName = event.user?.name || "Someone";
      const taskName = event.task?.name || payload?.taskName || "a task";

      switch (event.type) {
        case "TASK_CREATED":
          return `${userName} created "${taskName}"`;
        case "TASK_UPDATED":
          return `${userName} updated "${taskName}"`;
        case "TASK_DELETED":
          return `${userName} deleted "${taskName}"`;
        case "COMMENT_ADDED":
          return `${userName} commented on "${taskName}"`;
        case "ASSIGNEE_ADDED":
          return `You were assigned to "${taskName}"`;
        case "ASSIGNEE_REMOVED":
          return `You were removed from "${taskName}"`;
        default:
          return `${userName} performed an action on "${taskName}"`;
      }
    } catch (err) {
      return "Activity on a task";
    }
  };

  return (
    <Menu shadow="md" width={450} position="right-start" offset={230}>
      <Group>
        <Menu.Target>
          <ActionIcon variant="subtle" size="lg" pos="relative" color="white">
            <IconBell size={16} />
            {unreadCount > 0 && (
              <Badge
                size="xs"
                color="red"
                pos="absolute"
                top={4}
                right={4}
                style={{
                  zIndex: 1,
                  borderRadius: "full",
                  padding: "0 4px",
                  height: 16,
                  minWidth: 16,
                  lineHeight: "16px",
                  fontSize: 10,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </ActionIcon>
        </Menu.Target>
      </Group>
      <Menu.Dropdown>
        <Group justify="space-between" p="xs" pb="sm">
          <Text size="xl" fw={600}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="md"
              onClick={markAllAsRead}
              leftSection={<IconCheck size={15} />}
              loading={markAllAsReadMutation.isPending}
            >
              Mark all read
            </Button>
          )}
        </Group>

        <ScrollArea.Autosize mah={450}>
          {/* Loading state */}
          {isLoading && (
            <Group justify="center" p="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading notifications...
              </Text>
            </Group>
          )}

          {/* Error state */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              m="sm"
            >
              Failed to load notifications
            </Alert>
          )}

          {/* Empty state */}
          {!isLoading && !error && notifications.length === 0 && (
            <Text ta="center" p="xl">
              No notifications
            </Text>
          )}

          {/* Notification list */}
          {!isLoading && !error && notifications.length > 0 && (
            <Stack gap={0}>
              {notifications.map((notification: Notification) => (
                <Paper
                  key={notification.id}
                  p="sm"
                  style={{
                    backgroundColor: notification.read
                      ? "var(--monday-bg-card)"
                      : "var(--monday-bg-unread-noti)",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    !notification.read && markAsRead(notification.id)
                  }
                >
                  <Group gap="sm" align="flex-start">
                    <Avatar
                      src={notification.event?.user?.avatar}
                      size="md"
                      radius="xl"
                    >
                      {notification.event?.user?.name?.[0] || "S"}
                    </Avatar>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" align="flex-start" mb={4}>
                        <Text size="md" fw={500} style={{ lineHeight: 1.2 }}>
                          {notification.event?.type.replace(/_/g, " ")}
                        </Text>
                        <Group gap={4}>
                          <Badge
                            size="md"
                            color={getNotificationColor(
                              notification.event?.type || ""
                            )}
                            variant="dot"
                          />
                          <ActionIcon
                            variant="subtle"
                            size="xs"
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            loading={deleteNotificationMutation.isPending}
                          >
                            <IconTrash size={20} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Text size="sm" mb={4}>
                        {getNotificationMessage(notification)}
                      </Text>

                      <Text size="xs" c="dimmed">
                        {formatTime(notification.createdAt.toString())}
                      </Text>
                    </div>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
