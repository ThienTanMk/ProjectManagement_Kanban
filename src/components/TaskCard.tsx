import { Card, Text, Group, Badge, Avatar, Tooltip } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Task } from "@/types/api";
import { memo } from "react";
import {getPriorityColor} from "@/lib/utils";

interface TaskCardProps {
  card: Task;
  onViewTask: (task: Task) => void;
  isDragging?: boolean;
  isCalendarView?: boolean;
}

export default memo(function TaskCard({
  card,
  onViewTask,
  isDragging = false,
  isCalendarView = false,
}: TaskCardProps) {

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return dayjs(deadline).isBefore(dayjs());
  };

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false;
    const hoursLeft = dayjs(deadline).diff(dayjs(), "hour", true);
    return hoursLeft < 24 && hoursLeft > 0;
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return "";
    const date = dayjs(deadline);
    const diffInHours = date.diff(dayjs(), "hour", true);

    if (diffInHours < 0) return "Overdue";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h left`;
    return date.format("MM/DD/YYYY");
  };
  if (isCalendarView) {
    if (card.parentTaskId) return null;
    const priorityColor = getPriorityColor(card.priority);
    return (
      <Card
        shadow={isDragging ? "xl" : "sm"}
        className={`cursor-pointer w-full ${
          isDragging ? "ring-   4 ring-blue-500" : "border border-gray-200"
        }`}
        style={{
          backgroundColor: "var(--monday-bg-card)",
          transform: isDragging ? "scale(1.02)" : "scale(1)",
          transition: isDragging ? "transform 200ms ease" : "none",
          willChange: isDragging ? "transform" : "auto",
        }}
        onClick={() => onViewTask(card)}
      >
        <Text fw={500} size="sm" mb="xs"  c={priorityColor}>
          {card.name}
        </Text>

      </Card>
    );
  } 

  if (card.parentTaskId) return null;

  return (
    <Card
      shadow={isDragging ? "xl" : "sm"}
      className={`cursor-pointer w-full ${
        isDragging ? "ring-4 ring-blue-500" : "border border-gray-200"
      }`}
      style={{
        backgroundColor: "var(--monday-bg-card)",
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: isDragging ? "transform 200ms ease" : "none",
        willChange: isDragging ? "transform" : "auto",
      }}
      onClick={() => onViewTask(card)}
    >
      <Text fw={500} size="sm" mb="xs">
        {card.name}
      </Text>

      {card.description && (
        <Text size="xs" c="dimmed" mb="xs" className="line-clamp-2">
          {card.description}
        </Text>
      )}

      {card.deadline && (
        <Group gap="xs" mb="xs">
          <Badge
            size="xs"
            variant="light"
            color={
              isDeadlinePassed(card.deadline)
                ? "red"
                : isDeadlineNear(card.deadline)
                ? "orange"
                : "gray"
            }
            leftSection={<IconClock size={10} />}
          >
            {formatDeadline(card.deadline)}
          </Badge>
        </Group>
      )}

      <Group justify="space-between" align="flex-end" mt="xs">
        <Group gap="xs">
          {card.priority && (
            <Badge
              color={getPriorityColor(card.priority)}
              variant="light"
              size="xs"
            >
              {card.priority}
            </Badge>
          )}
          {card.actualTime !== undefined && card.actualTime > 0 && (
            <Badge size="xs" variant="outline" color="blue">
              {card.actualTime}h
            </Badge>
          )}
        </Group>

        {card.assignees && card.assignees.length > 0 && (
          <Avatar.Group spacing="xs">
            {card.assignees.slice(0, 3).map((assignee, idx) => (
              <Tooltip key={idx} label={assignee.user.name} position="top">
                <Avatar size="xs" radius="xl" src={assignee.user.avatar}>
                  {(assignee.user.name.charAt(0) || "R").toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
            {card.assignees.length > 3 && (
              <Avatar size="xs" radius="xl">
                +{card.assignees.length - 3}
              </Avatar>
            )}
          </Avatar.Group>
        )}
      </Group>
    </Card>
  );
});