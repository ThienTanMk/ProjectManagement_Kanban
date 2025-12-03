"use client";
import { useState } from "react";
import {
  Menu,
  ActionIcon,
  Text,
  Avatar,
  Paper,
  Button,
  Alert,
  Loader,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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
import { useRouter } from "next/navigation";
import { useProfileCompletionStore } from "@/hooks/user";
import TaskDetailModal from "./TaskDetailModal";
dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const { data: notifications = [], isLoading, error } = useGetNotifications();
  const { data: unreadCount = 0 } = useGetUnreadCount();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalOpened, setTaskModalOpened] = useState(false);

  const router = useRouter();
  const { setPendingProjectId, setShouldShowProfileModal } =
    useProfileCompletionStore();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // If notification has a task, open the task detail modal
    if (notification.event?.taskId) {
      setSelectedTaskId(notification.event.taskId);
      setTaskModalOpened(true);
      return;
    }

    // Handle other notification types (MEMBER_ADDED, INVITE_ACCEPTED, etc.)
    if (
      notification.event?.type === "MEMBER_ADDED" ||
      notification.event?.type === "INVITE_ACCEPTED"
    ) {
      let projectId: string | undefined;
      try {
        const payload = JSON.parse(notification.event.payload || "{}");
        projectId = payload.projectId;
      } catch {}

      if (projectId) {
        try {
          const response = await fetch(
            `/api/projects/${projectId}/member-profile-status`
          );
          const { profileCompleted } = await response.json();

          if (!profileCompleted) {
            setPendingProjectId(projectId);
            setShouldShowProfileModal(true);
          } else {
            router.push(`/?projectId=${projectId}`);
          }
        } catch (error) {
          console.error("Failed to check profile status:", error);
        }
      }
    }
  };

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

    const userName = event.user?.name || "Someone";
    const taskName = event.task?.name || "a task";

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

    switch (event.type) {
      case "TASK_CREATED":
        return `${userName} created task "${taskName}"`;
      case "TASK_UPDATED":
        return `${userName} updated task "${taskName}"`;
      case "TASK_DELETED":
        return `${userName} deleted task "${taskName}"`;
      case "COMMENT_ADDED":
        return `${userName} added a comment on "${taskName}"`;
      case "COMMENT_UPDATED":
        return `${userName} updated a comment on "${taskName}"`;
      case "COMMENT_DELETED":
        return `${userName} deleted a comment on "${taskName}"`;
      case "TASK_STATUS_UPDATED":
        return `${userName} moved task "${taskName}" to ${newStatus}`;
      case "ASSIGNEE_ADDED":
        return `${userName} assigned ${assigneeName} to "${taskName}"`;
      case "ASSIGNEE_REMOVED":
        return `${userName} removed ${assigneeName} from "${taskName}"`;
      case "TAG_ADDED":
        return `${userName} added tag "${tagName}" to "${taskName}"`;
      case "TAG_REMOVED":
        return `${userName} removed tag "${tagName}" from "${taskName}"`;
      case "SUBTASK_ADDED":
        return `${userName} added subtask "${subtaskName}" to "${taskName}"`;
      case "SUBTASK_REMOVED":
        return `${userName} removed subtask "${subtaskName}" from "${taskName}"`;
      default:
        return `${userName} performed an action on "${taskName}"`;
    }
  };

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuNotiOpened, setMenuNotiOpened] = useState(false);

  const NotificationsHeader = (
    <div className="flex items-center justify-between px-3 pb-2">
      <Text className="text-lg font-semibold" fw={700}>Notifications</Text>
      {unreadCount > 0 && (
        <Button
          variant="subtle"
          size="sm"
          onClick={markAllAsRead}
          leftSection={<IconCheck size={14} />}
          loading={markAllAsReadMutation.isPending}
          className="text-sm"
        >
          Mark all read
        </Button>
      )}
    </div>
  );

  const NotificationsList = (
    <div
      className={
        (isMobile ? "max-h-[60vh]" : "max-h-[500px]") +
        " w-full flex-1 min-h-0 overflow-auto px-3 pb-3"
      }
      role="list"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader size="sm" />
          <Text className="text-sm text-gray-400 ml-2">Loading notifications...</Text>
        </div>
      )}

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          className="my-2"
        >
          Failed to load notifications
        </Alert>
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <div className="text-center py-6">
          <Text>No notifications</Text>
        </div>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="flex flex-col gap-0">
          {notifications.map((notification: Notification) => (
            <Paper
              key={notification.id}
              p="sm"
              className={
                "mb-2 p-3 rounded-md " +
                (notification.read
                  ? "bg-[var(--monday-bg-card)]"
                  : "bg-[var(--monday-bg-unread-noti)]") +
                " cursor-pointer"
              }
              onClick={() => handleNotificationClick(notification)}
              withBorder={false}
            >
              <div className="flex gap-3 items-start">
                <Avatar
                  src={notification.event?.user?.avatar}
                  size="md"
                  radius="xl"
                >
                  {notification.event?.user?.name?.[0] || "S"}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <Text className="text-sm font-medium truncate">
                      {notification.event?.type?.replace(/_/g, " ")}
                    </Text>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            getNotificationColor(notification.event?.type || ""),
                        }}
                        aria-hidden
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
                        <IconTrash size={16} />
                      </ActionIcon>
                    </div>
                  </div>

                  <Text className="text-sm mb-1 truncate text-[var(--monday-text-secondary)]">
                    {getNotificationMessage(notification)}
                  </Text>

                  <Text className="text-xs text-gray-400">
                    {formatTime(notification.createdAt.toString())}
                  </Text>
                </div>
              </div>
            </Paper>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Menu
          shadow="md"
          width="90%"
          position="bottom"
          opened={menuNotiOpened}
          onClose={() => setMenuNotiOpened(false)}
        >
          <Menu.Target>
            <div className="relative">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setMenuNotiOpened((s) => !s)}
              >
                <IconBell size={16} />
              </ActionIcon>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] h-4 min-w-4 px-1 rounded-full bg-red-600 text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </Menu.Target>

          <Menu.Dropdown className="max-h-[70vh] flex flex-col p-0">
            {NotificationsHeader}
            {NotificationsList}
          </Menu.Dropdown>
        </Menu>

        <TaskDetailModal
          opened={taskModalOpened}
          onClose={() => {
            setTaskModalOpened(false);
            setSelectedTaskId(null);
          }}
          taskId={selectedTaskId as string}
        />
      </>
    );
  }

  return (
    <>
      <Menu shadow="md" width={450} position="right-start" offset={230}>
        <div className="relative">
          <Menu.Target>
            <ActionIcon variant="subtle" size="lg">
              <IconBell size={16} />
            </ActionIcon>
          </Menu.Target>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] h-4 min-w-4 px-1 rounded-full bg-red-600 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>

        <Menu.Dropdown className="p-0">
          <div className="px-3 pb-2">
            {NotificationsHeader}
          </div>
          {NotificationsList}
        </Menu.Dropdown>
      </Menu>

      <TaskDetailModal
        opened={taskModalOpened}
        onClose={() => {
          setTaskModalOpened(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId as string}
      />
    </>
  );
}
