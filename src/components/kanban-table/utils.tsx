// import dayjs from "dayjs";
// import { Badge, Text } from "@mantine/core";
// import { Task } from "@/types/api";

// export const getStatusColor = (status: string) => {
//   switch (status) {
//     case "Backlog":
//       return "gray";
//     case "To Do":
//       return "orange";
//     case "In Progress":
//       return "blue";
//     case "Code Review":
//       return "purple";
//     case "Testing":
//       return "cyan";
//     case "Done":
//       return "green";
//     default:
//       return "gray";
//   }
// };

// export const getPriorityColor = (priority?: string) => {
//   switch (priority) {
//     case "HIGH":
//       return "red";
//     case "MEDIUM":
//       return "yellow";
//     case "LOW":
//       return "green";
//     default:
//       return "gray";
//   }
// };

// export const formatDate = (dateString?: string) => {
//   if (!dateString) return "-";
//   return dayjs(dateString).format("MMM DD, YYYY");
// };

// export const formatDeadline = (deadline?: string) => {
//   if (!deadline) return "-";
//   const date = dayjs(deadline);
//   const now = dayjs();
  
//   if (date.isBefore(now)) {
//     return (
//       <Badge color="red" variant="light" size="xs">
//         Overdue
//       </Badge>
//     );
//   } else if (date.diff(now, "hour") < 24) {
//     return (
//       <Badge color="orange" variant="light" size="xs">
//         {date.diff(now, "hour")}h left
//       </Badge>
//     );
//   } else {
//     return <Text size="sm">{date.format("MMM DD, YYYY")}</Text>;
//   }
// };

// // Mock data - có thể thay thế bằng API call thật
// export const getSubtasksForTask = (taskId: string): Task[] => {
//   return [
//     {
//       id: `${taskId}-sub-1`,
//       name: `Subtask for ${taskId}`,
//       description: "Example subtask",
//       priority: "HIGH",
//       deadline: dayjs().add(1, "day").toISOString(),
//       statusId: "todo",
//       actualTime: 2,
//     },
//     {
//       id: `${taskId}-sub-2`,
//       name: `Another subtask for ${taskId}`,
//       description: "Example subtask 2",
//       priority: "LOW",
//       deadline: dayjs().add(2, "day").toISOString(),
//       statusId: "done",
//       actualTime: 1,
//     },
//   ];
// };