"use client";
import { Card, Text, Group, Badge, Avatar, Tooltip } from "@mantine/core";
import { Draggable } from "@hello-pangea/dnd";
import { IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Task } from "@/types/api";
dayjs.extend(relativeTime);
interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}
interface TaskCardProps {
  card: Task;
  index: number;
  onViewTask: (task: Task) => void;
  isCalendarView?: boolean;
  canDragTasks?: boolean;
}
export default function TaskCard({
  card,
  index,
  onViewTask,
  isCalendarView = false,
  canDragTasks = true,
}: TaskCardProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "green";
      default:
        return "gray";
    }
  };

  // const pastelColors = [
  //   "#FFF5F5", // light red
  //   "#FFFBEA", // light yellow
  //   "#E6FFFA", // light cyan
  //   "#E3F2FD", // light blue
  //   "#F3E8FF", // light purple
  //   "#E6FFED", // light green
  //   "#FFF0F6", // light magenta/pink
  //   "#FFF7E6", // light orange
  // ];

  // //Tạo hàm lấy màu cố định theo ID (để không đổi khi re-render)
  // const getBackgroundColor = (id: string) => {
  //   let hash = 0;
  //   for (let i = 0; i < id.length; i++) {
  //     hash = id.charCodeAt(i) + ((hash << 5) - hash);
  //   }
  //   const index = Math.abs(hash) % pastelColors.length;
  //   return pastelColors[index];
  // };

  if (isCalendarView) {
    const priorityColor = getPriorityColor(card.priority);
    return (
      <Draggable
        key={card.id}
        draggableId={card.id}
        index={index}
        isDragDisabled={!canDragTasks}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => onViewTask(card)}
            className="flex items-center justify-between w-full p-2 rounded-md cursor-pointer mb-1 bg-gray-100 hover:bg-gray-200"
          >
            <Text size="md" fw={500} c={priorityColor}>
              {card.name}
            </Text>
          </div>
        )}
      </Draggable>
    );
  }
  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = dayjs(deadline);
    const now = dayjs();
    const hoursLeft = deadlineDate.diff(now, "hour", true);
    return hoursLeft < 24 && hoursLeft > 0;
  };
  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = dayjs(deadline);
    const now = dayjs();
    return deadlineDate.isBefore(now);
  };
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return "";
    const date = dayjs(deadline);
    const now = dayjs();
    const diffInHours = date.diff(now, "hour", true);
    if (diffInHours < 0) {
      return "Overdue";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h left`;
    } else {
      return date.format("MM/DD/YYYY");
    }
  };
  return (
    <Draggable
      key={card.id}
      draggableId={card.id}
      index={index}
      isDragDisabled={!canDragTasks}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          shadow={snapshot.isDragging ? "xl" : "sm"}
          className={`bg-white cursor-pointer w-[200px] ${
            snapshot.isDragging
              ? "ring-4 ring-blue-500"
              : "border border-gray-200"
          }`}
          // style={{
          //   backgroundColor: getBackgroundColor(card.id),
          // }}
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
      )}
    </Draggable>
  );
}
