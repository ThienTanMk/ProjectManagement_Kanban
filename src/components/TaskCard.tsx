import { Card, Text, Group, Badge, Avatar, Tooltip, Box } from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowUpLeft,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconHexagon,
  IconMessageCircle,
  IconStarFilled,
  IconSubtask,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Task } from "@/types/api";
import { memo } from "react";
import { getPriorityColor } from "@/lib/utils";
import { useGetCommentByTaskId } from "@/hooks/comment";
import { useGetSubtasks, useTask } from "@/hooks/task";

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
  const hasProgress = card.estimatedTime && card.actualTime !== undefined;
  const progressCompleted = card.actualTime || 0;
  const progressTotal = card.estimatedTime || 0;
  const isCompleted = hasProgress && progressCompleted >= progressTotal;

  const { data: comments } = useGetCommentByTaskId(card.id);
  const commentsCount = comments?.length ?? 0;

  const { data: subtasks } = useGetSubtasks(card.id);
  const subtaskCount = subtasks?.length ?? 0;

  const { data: parentTask } = useTask(card.parentTaskId || "");
  const priorityColor = getPriorityColor(card.priority);

  if (isCalendarView) {
    const getPriorityIcon = () => {
      if (isCompleted)
        return (
          <IconCircleCheck size={12} color={getPriorityColor("completed")} />
        );
      switch (card.priority) {
        case "HIGH":
          return <IconAlertCircle size={12} color={priorityColor} />;
        case "MEDIUM":
          return <IconStarFilled size={12} color={priorityColor} />;
        case "LOW":
          return <IconHexagon size={12} color={priorityColor} />;
        default:
          return null;
      }
    };

    return (
      <Card
        shadow={isDragging ? "xl" : "sm"}
        className={`cursor-pointer w-full ${
          isDragging ? "ring-2 ring-blue-500" : ""
        }`}
        style={{
          backgroundColor: "var(--monday-bg-card)",
          borderRadius: 6,
          borderLeft: `3px solid ${priorityColor}`,
          zIndex: isDragging ? 9999 : "auto",
          position: "relative",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onViewTask(card);
        }}
        p={8}
      >
        <Group gap={6} wrap="nowrap" align="center">
          {card.parentTaskId && (
            <Box style={{ flexShrink: 0 }}>
              <IconSubtask size={12} color="#228be6" />
            </Box>
          )}
          <Box style={{ flexShrink: 0 }}>{getPriorityIcon()}</Box>

          <Text
            size="xs"
            fw={500}
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}
            title={card.name}
          >
            {card.name}
          </Text>

          {card.priority && (
            <Badge
              size="xs"
              variant="light"
              color={priorityColor}
              style={{
                fontSize: 8,
                height: 16,
                padding: "0 4px",
                flexShrink: 0,
              }}
            >
              {card.priority.charAt(0)}
            </Badge>
          )}
        </Group>
      </Card>
    );
  }

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
        borderRadius: 8,
        overflow: "hidden",
      }}
      onClick={() => onViewTask(card)}
    >
      {card.parentTaskId && (
        <Box
          pos="absolute"
          top={8}
          left={8}
          style={{
            borderRadius: 6,
            padding: "6px 4px",
            zIndex: 10,
          }}
        >
          <IconSubtask size={16} color="#228be6" />
        </Box>
      )}
      <div style={{ padding: "10px 12px" }}>
        <Group gap={8} mb={8} wrap="nowrap" align="flex-start">
          <div
            style={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--monday-bg-card)",
              borderRadius: 4,
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            {!card.parentTaskId && (
              <IconCircleCheck size={14} style={{ opacity: 0.6 }} />
            )}
          </div>

          <Text fw={500} size="sm" style={{ flex: 1, lineHeight: 1.4 }}>
            {card.name}
          </Text>

          {card.priority === "MEDIUM" && !isCompleted && (
            <IconStarFilled
              size={16}
              style={{ color: getPriorityColor("MEDIUM"), flexShrink: 0 }}
            />
          )}
          {card.priority === "HIGH" && !isCompleted && (
            <IconAlertCircle
              size={16}
              style={{ color: getPriorityColor("HIGH"), flexShrink: 0 }}
            />
          )}
          {card.priority === "LOW" && !isCompleted && (
            <IconHexagon
              size={16}
              style={{ color: getPriorityColor("LOW"), flexShrink: 0 }}
            />
          )}
          {isCompleted && (
            <IconCircleCheck
              size={16}
              style={{ color: getPriorityColor("completed"), flexShrink: 0 }}
            />
          )}
        </Group>

        {card.description && (
          <Text
            size="xs"
            c="dimmed"
            mb={12}
            lineClamp={2}
            style={{ lineHeight: 1.4 }}
          >
            {card.description}
          </Text>
        )}

        {card.priority && (
          <Group gap={6} mb={0}>
            <Badge
              size="xs"
              variant="light"
              color={getPriorityColor(card.priority)}
              style={{
                fontSize: 10,
                paddingLeft: 6,
                paddingRight: 6,
                height: 20,
                fontWeight: 500,
              }}
            >
              {card.priority}
            </Badge>
          </Group>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px dashed var(--mantine-color-gray-6)",
        }}
      >
        <Group justify="space-between" wrap="wrap" gap={8}>
          <Group gap={12} style={{ fontSize: 12 }}>
            {card.deadline && (
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
                leftSection={<IconCalendar size={10} />}
              >
                {formatDeadline(card.deadline)}
              </Badge>
            )}

            {/* Comments */}
            {commentsCount > 0 && (
              <Group
                gap={6}
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                <IconMessageCircle size={12} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  {commentsCount}
                </Text>
              </Group>
            )}

            {/* subtask */}
            {subtaskCount > 0 && (
              <Group
                gap={6}
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                <IconSubtask size={12} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  {subtaskCount}
                </Text>
              </Group>
            )}

            {card.parentTaskId && parentTask && (
              <Group gap={4} align="center">
                <IconArrowUpLeft size={12} color="#228be6" />
                <Text
                  size="xs"
                  c="blue"
                  fw={500}
                  truncate
                  style={{ maxWidth: 120 }}
                >
                  {parentTask.name}
                </Text>
              </Group>
            )}
          </Group>

          {card.assignees && card.assignees.length > 0 && (
            <Avatar.Group spacing="xs">
              {card.assignees.slice(0, 3).map((assignee, idx) => (
                <Tooltip
                  key={idx}
                  label={assignee?.user?.name ?? assignee?.userId ?? "Unknown"}
                  position="top"
                >
                  <Avatar
                    size="xs"
                    radius="xl"
                    src={assignee?.user?.avatar ?? undefined}
                  >
                    {(
                      assignee?.user?.name?.charAt(0) ??
                      assignee?.userId?.charAt(0) ??
                      "R"
                    ).toUpperCase()}
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
      </div>
    </Card>
  );
});
