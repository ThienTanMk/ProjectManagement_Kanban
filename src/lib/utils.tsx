import { EventType, Task } from '@/types/api';
import { Badge, Text } from '@mantine/core';
import dayjs from "dayjs";

export const getPriorityColor = (priority?: string) => {
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

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Backlog":
      return "gray";
    case "To Do":
      return "orange";
    case "In Progress":
      return "blue";
    case "Code Review":
      return "purple";
    case "Testing":
      return "cyan";
    case "Done":
      return "green";
    default:
      return "gray";
  }
};

export const getNotificationColor = (eventType: string) => {
    if (eventType.includes("TASK")) return "blue";
    if (eventType.includes("COMMENT")) return "orange";
    if (eventType.includes("ASSIGNEE")) return "green";
    if (eventType.includes("TAG")) return "purple";
    return "gray";
  };

export const formatTime = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

export const formatDate = (date?: string) =>
  date ? dayjs(date).format("MMM DD, YYYY HH:mm") : "-";

/**
 * subtasks mock data
 */
export const generateSubtasksForTask = (taskId: string, parentName: string) => {
  const subtasks = [
    {
      id: `${taskId}-1`,
      name: `Setup ${parentName} UI`,
      description: "Design and implement UI components",
      priority: "HIGH",
      estimatedTime: 3,
      deadline: dayjs().add(1, "day").toISOString(),
    },
    {
      id: `${taskId}-2`,
      name: `Write backend APIs`,
      description: "Implement and test related REST APIs",
      priority: "MEDIUM",
      estimatedTime: 5,
      deadline: dayjs().add(2, "day").toISOString(),
    },
    {
      id: `${taskId}-3`,
      name: `Integrate and test`,
      description: "Connect frontend and backend and run tests",
      priority: "LOW",
      estimatedTime: 2,
      deadline: dayjs().add(3, "day").toISOString(),
    },
  ];
  return subtasks;
};


export const formatDeadline = (deadline?: string) => {
  if (!deadline) return "-";
  const date = dayjs(deadline);
  const now = dayjs();
  
  if (date.isBefore(now)) {
    return (
      <Badge color="red" variant="light" size="xs">
        Overdue
      </Badge>
    );
  } else if (date.diff(now, "hour") < 24) {
    return (
      <Badge color="orange" variant="light" size="xs">
        {date.diff(now, "hour")}h left
      </Badge>
    );
  } else {
    return <Text size="sm">{date.format("MMM DD, YYYY")}</Text>;
  }
};
