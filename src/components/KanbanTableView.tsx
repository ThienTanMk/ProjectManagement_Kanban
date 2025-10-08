"use client";
import { useMemo } from "react";
import {
  Table,
  Paper,
  Text,
  Badge,
  Group,
  ActionIcon,
  Menu,
  Stack,
  Box,
  Container,
} from "@mantine/core";
import { IconDots, IconEye, IconGripVertical } from "@tabler/icons-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import dayjs from "dayjs";
import { Task, StatusTask } from "@/types/api";

interface KanbanTableViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;

  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  statuses?: StatusTask[];
}
export default function KanbanTableView({
  tasks,
  onViewTask,
  onTaskStatusChange,
  statuses = [],
}: KanbanTableViewProps) {
  const getStatusColor = (status: string) => {
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
  const taskGroups = useMemo(() => {
    // Use statuses from props if available, otherwise fall back to hardcoded values
    const statusOrder =
      statuses.length > 0
        ? statuses.sort((a, b) => a.order - b.order).map((s) => s.name)
        : [];

    const grouped = tasks.reduce((acc, task) => {
      const status = task.status.name;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return statusOrder.map((status) => ({
      status,
      tasks: grouped[status] || [],
      color: getStatusColor(status),
    }));
  }, [tasks, statuses]);
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
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("MMM DD, YYYY");
  };
  const formatDeadline = (deadline?: string) => {
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
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    console.log(destination, source);
    const sourceGroupIndex = taskGroups.findIndex(
      (group) => `table-${group.status}` === source.droppableId
    );
    const destGroupIndex = taskGroups.findIndex(
      (group) => `table-${group.status}` === destination.droppableId
    );
    if (sourceGroupIndex === -1 || destGroupIndex === -1) return;
    const sourceGroup = taskGroups[sourceGroupIndex];
    const destGroup = taskGroups[destGroupIndex];
    const taskToMove = sourceGroup.tasks.find(
      (task) => task.id === draggableId
    );

    if (!taskToMove) return;
    let newTasks = [...tasks];
    newTasks = newTasks.filter((task) => task.id !== draggableId);
    if (sourceGroup.status !== destGroup.status) {
      const deskId = statuses.find(
        (task) => task.name === destGroup.status
      )?.id;

      if (onTaskStatusChange && deskId) {
        onTaskStatusChange(taskToMove.id, deskId);
      }
    }
  };
  const TaskRow = ({
    task,
    index,
    groupStatus,
  }: {
    task: Task;
    index: number;
    groupStatus: string;
  }) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Table.Tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? "#f8f9fa" : "transparent",
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <Table.Td>
            <Group gap="sm" align="center">
              <div
                {...provided.dragHandleProps}
                className="cursor-grab active:cursor-grabbing"
              >
                <IconGripVertical size={16} color="#999" />
              </div>
              <div>
                <Text fw={500} size="sm" className="truncate max-w-[200px]">
                  {task.name}
                </Text>
                {task.description && (
                  <Text size="xs" c="dimmed" className="truncate max-w-[200px]">
                    {task.description}
                  </Text>
                )}
              </div>
            </Group>
          </Table.Td>
          <Table.Td>
            {task.priority && (
              <Badge
                color={getPriorityColor(task.priority)}
                variant="outline"
                size="sm"
              >
                {task.priority?.toUpperCase()}
              </Badge>
            )}
          </Table.Td>
          <Table.Td>
            <Text size="sm">
              {task.assignees && task.assignees.length > 0
                ? task.assignees.map((a) => a.user.name).join(", ")
                : "-"}
            </Text>
          </Table.Td>
          <Table.Td>{formatDeadline(task.deadline)}</Table.Td>
          <Table.Td>
            <Text size="sm">
              {task.actualTime !== undefined && task.actualTime > 0
                ? `${task.actualTime}h`
                : "-"}
            </Text>
          </Table.Td>
          <Table.Td>
            <Menu shadow="md" width={120}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEye size={14} />}
                  onClick={() => onViewTask(task)}
                >
                  View
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Table.Td>
        </Table.Tr>
      )}
    </Draggable>
  );
  return (
    <Container fluid>
      <div className="mb-4">
        <Text size="lg" fw={600}>
          Tasks Table View by Status
        </Text>
        <Text size="sm" c="dimmed">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} total across{" "}
          {taskGroups.filter((group) => group.tasks.length > 0).length} status
          groups
        </Text>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack gap="lg">
          {taskGroups.map((group) => (
            <Paper
              key={group.status}
              shadow="sm"
              p="md"
              style={{
                border: `2px solid var(--mantine-color-${group.color}-3)`,
                borderRadius: "8px",
              }}
            >
              <Group justify="space-between" mb="md">
                <Group gap="sm">
                  <Badge
                    color={group.color}
                    variant="light"
                    size="lg"
                    style={{ fontWeight: 600 }}
                  >
                    {group.status}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {group.tasks.length} task
                    {group.tasks.length !== 1 ? "s" : ""}
                  </Text>
                </Group>
              </Group>
              <Droppable droppableId={`table-${group.status}`}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      backgroundColor: snapshot.isDraggingOver
                        ? `var(--mantine-color-${group.color}-0)`
                        : "transparent",
                      borderRadius: "4px",
                      minHeight: group.tasks.length === 0 ? "60px" : "auto",
                      padding: snapshot.isDraggingOver ? "8px" : "0",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {group.tasks.length > 0 ? (
                      <Table
                        striped
                        highlightOnHover
                        className="w-full table-fixed border-collapse"
                      >
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th className="w-[20%]">Task</Table.Th>
                            <Table.Th className="w-[10%]">Priority</Table.Th>
                            <Table.Th className="w-[25%]">Assignees</Table.Th>
                            <Table.Th className="w-[15%]">Deadline</Table.Th>
                            <Table.Th className="w-[15%]">Actual Time</Table.Th>
                            <Table.Th className="w-[10%]">Actions</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {group.tasks.map((task, index) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              index={index}
                              groupStatus={group.status}
                            />
                          ))}
                        </Table.Tbody>
                      </Table>
                    ) : (
                      <Box
                        p="xl"
                        style={{
                          textAlign: "center",
                          border: snapshot.isDraggingOver
                            ? `2px dashed var(--mantine-color-${group.color}-4)`
                            : `1px dashed var(--mantine-color-gray-4)`,
                          borderRadius: "4px",
                          backgroundColor: snapshot.isDraggingOver
                            ? `var(--mantine-color-${group.color}-0)`
                            : "var(--mantine-color-gray-0)",
                        }}
                      >
                        <Text c="dimmed" size="sm">
                          {snapshot.isDraggingOver
                            ? `Drop task here to move to ${group.status}`
                            : `No tasks in ${group.status}`}
                        </Text>
                      </Box>
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Stack>
      </DragDropContext>
    </Container>
  );
}
