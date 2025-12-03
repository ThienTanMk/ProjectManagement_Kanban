"use client";
import { useMemo, useState } from "react";
import { Container, Text, Stack } from "@mantine/core";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Task, TaskState } from "@/types/api";
import { StatusGroup } from "./kanban-table";
import { getStatusColor } from "@/lib/utils";

interface KanbanTableViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  statuses?: TaskState[];
}

export default function KanbanTableView({
  tasks,
  onViewTask,
  onTaskStatusChange,
  statuses = [],
}: KanbanTableViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const taskGroups = useMemo(() => {
    const statusMap = new Map<string, { name: string; position: number | null }>();
    statuses.forEach((s) => {
      statusMap.set(s.id, { name: s.name, position: s.position });
    });

    const sortedStatuses = [...statuses].sort((a, b) => {
      if (a.position !== null && b.position !== null) {
        return a.position - b.position;
      }
      return 0;
    });
    const statusOrder = sortedStatuses.map((s) => s.name);

    const grouped = tasks.reduce((acc, task) => {
      const statusName =
        task.taskState?.name ||
        (task.statusId && statusMap.has(task.statusId)
          ? statusMap.get(task.statusId)!.name
          : "Unknown");

      if (!acc[statusName]) {
        acc[statusName] = [];
      }
      acc[statusName].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const finalStatusOrder = [...statusOrder];
    if (
      grouped["Unknown"] &&
      grouped["Unknown"].length > 0 &&
      !finalStatusOrder.includes("Unknown")
    ) {
      finalStatusOrder.push("Unknown");
    }

    return finalStatusOrder.map((status) => ({
      status,
      tasks: grouped[status] || [],
      color: getStatusColor(status),
    }));
  }, [tasks, statuses]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceGroupIndex = taskGroups.findIndex(
      (group) => `table-${group.status}` === source.droppableId
    );
    const destGroupIndex = taskGroups.findIndex(
      (group) => `table-${group.status}` === destination.droppableId
    );

    if (sourceGroupIndex === -1 || destGroupIndex === -1) return;

    const sourceGroup = taskGroups[sourceGroupIndex];
    const destGroup = taskGroups[destGroupIndex];
    const taskToMove = sourceGroup.tasks.find((task) => task.id === draggableId);

    if (!taskToMove) return;

    if (sourceGroup.status !== destGroup.status) {
      const deskId = statuses.find((task) => task.name === destGroup.status)?.id;

      if (onTaskStatusChange && deskId) {
        onTaskStatusChange(taskToMove.id, deskId);
      }
    }
  };

  const toggleTaskExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <Container
      fluid
      className="bg-[var(--monday-bg-board)] text-[var(--monday-text-primary)]"
      style={{
        width: "100vw",
        maxWidth: "100%",
        paddingLeft: 0,
        paddingRight: 0,
        margin: 0,
      }}
    >
      <div className="mb-4 p-1">
        <Text size="lg" fw={600} c="var(--monday-text-primary)">
          Tasks Table View by Status
        </Text>
        <Text size="sm" c="var(--monday-text-secondary)">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} total across{" "}
          {taskGroups.filter((group) => group.tasks.length > 0).length} status groups
        </Text>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack>
          {taskGroups.map((group) => (
            <StatusGroup
              key={group.status}
              status={group.status}
              color={group.color}
              tasks={group.tasks}
              expandedTasks={expandedTasks}
              onViewTask={onViewTask}
              onToggleExpansion={toggleTaskExpansion}
            />
          ))}
        </Stack>
      </DragDropContext>
    </Container>
  );
}
