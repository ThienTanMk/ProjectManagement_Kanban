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
} from "@mantine/core";
import { IconBell, IconCheck, IconMessageChatbot, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "task" | "mention" | "system" | "invite";
  read: boolean;
  createdAt: string;
  avatar?: string;
  author?: string;
}
export default function NotificationDropdown() {
  const [chatOpened, setChatOpened] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New task assigned",
      message: "You have been assigned to 'Implement authentication'",
      type: "task",
      read: false,
      createdAt: "2025-08-14T10:30:00Z",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40",
      author: "John Doe",
    },
    {
      id: "2",
      title: "Comment added",
      message: "Jane Smith commented on 'Design review'",
      type: "mention",
      read: false,
      createdAt: "2025-08-14T09:15:00Z",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40",
      author: "Jane Smith",
    },
    {
      id: "3",
      title: "Task completed",
      message: "'Setup database' has been marked as complete",
      type: "task",
      read: true,
      createdAt: "2025-08-14T08:45:00Z",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40",
      author: "Bob Johnson",
    },
    {
      id: "4",
      title: "New team member",
      message: "Alice Brown joined the project",
      type: "system",
      read: true,
      createdAt: "2025-08-14T07:30:00Z",
    },
    {
      id: "5",
      title: "Project invite",
      message: "You've been invited to 'Mobile App Project'",
      type: "invite",
      read: false,
      createdAt: "2025-08-14T06:00:00Z",
    },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };
  const formatTime = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task":
        return "blue";
      case "mention":
        return "orange";
      case "system":
        return "green";
      case "invite":
        return "purple";
      default:
        return "gray";
    }
  };
  return (
    <Menu shadow="md" width={450} position="bottom-end">
      <Group>
        <Menu.Target>
          <ActionIcon variant="subtle" size="lg" pos="relative">
            <IconBell size={40} />
            {unreadCount > 0 && (
              <Badge
                size="xs"
                circle
                color="red"
                pos="absolute"
                top={4}
                right={4}
                style={{ zIndex: 1 }}
              >
                {unreadCount}
              </Badge>
            )}
          </ActionIcon>
        </Menu.Target>
          <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => setChatOpened(true)}
        >
          <IconMessageChatbot size={28} />
          </ActionIcon>
      </Group>

      {/* chatbot tạm */}
      <Drawer
        opened={chatOpened}
        onClose={() => setChatOpened(false)}
        title="Chatbot"
        position="right"
        size="md"
      >
        <div style={{ height: "400px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", border: "1px solid #ddd", padding: "8px" }}>
            <p><b>Bot:</b> Xin chào! Tôi có thể giúp gì cho bạn?</p>
          </div>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px",
              marginTop: "8px",
            }}
          />
        </div>
      </Drawer>

      <Menu.Dropdown>
        <Group justify="space-between" p="xs" pb="sm">
          <Text size="xl" fw={600}>Notifications</Text>
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="md"
              onClick={markAllAsRead}
              leftSection={<IconCheck size={15} />}
            >
              Mark all read
            </Button>
          )}
        </Group>
        <ScrollArea.Autosize mah={450}>
          {notifications.length === 0 ? (
            <Text ta="center" c="dimmed" p="xl">
              No notifications
            </Text>
          ) : (
            <Stack gap={0}>
              {notifications.map((notification) => (
                <Paper
                  key={notification.id}
                  p="sm"
                  style={{
                    backgroundColor: notification.read
                      ? "transparent"
                      : "var(--mantine-color-blue-0)",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    !notification.read && markAsRead(notification.id)
                  }
                >
                  <Group gap="sm" align="flex-start">
                    <Avatar src={notification.avatar} size="md" radius="xl">
                      {notification.author ? notification.author[0] : "S"}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" align="flex-start" mb={4}>
                        <Text size="md" fw={500} style={{ lineHeight: 1.2 }}>
                          {notification.title}
                        </Text>
                        <Group gap={4}>
                          <Badge
                            size="md"
                            color={getNotificationColor(notification.type)}
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
                          >
                            <IconTrash size={20} />
                          </ActionIcon>
                        </Group>
                      </Group>
                      <Text size="sm" c="dimmed" mb={4}>
                        {notification.message}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatTime(notification.createdAt)}
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
