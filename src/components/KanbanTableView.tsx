"use client";
import { useMemo, useState, useCallback } from "react";
import { Container, Text, Stack } from "@mantine/core";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Task, TaskState, UpdateTaskDto } from "@/types/api";
import { StatusGroup } from "./kanban-table";
import { getStatusColor } from "@/lib/utils";
import { useUpdateTask } from "@/hooks/task";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/hooks/task";
import { useProjectStore } from "@/stores/projectStore";
import { useAuth } from "@/hooks/useAuth";
import { notifications } from "@mantine/notifications";
import { triggerConfetti } from "@/lib/confetti";

interface KanbanTableViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  statuses?: TaskState[];
}

interface TableOrderMap {
  [columnId: string]: string[];
}

export default function KanbanTableView({
  tasks,
  onViewTask,
  onTaskStatusChange,
  statuses = [],
}: KanbanTableViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [tableOrderMaps, setTableOrderMaps] = useState<TableOrderMap>({});
  
  const queryClient = useQueryClient();
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();
  const { mutateAsync: updateTask } = useUpdateTask();

  // Khởi tạo TableOrderMap từ tasks
  useMemo(() => {
    if (!tasks || tasks.length === 0) return;

    const maps: TableOrderMap = {};
    const tasksByColumn = tasks.reduce((acc, task) => {
      if (!acc[task.statusId]) {
        acc[task.statusId] = [];
      }
      acc[task.statusId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    Object.entries(tasksByColumn).forEach(([columnId, columnTasks]) => {
      maps[columnId] = columnTasks
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((t) => t.id);
    });

    setTableOrderMaps(maps);
  }, [tasks]);

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

    return finalStatusOrder.map((status) => {
      const statusId = statuses.find((s) => s.name === status)?.id || "";
      const orderedTaskIds = tableOrderMaps[statusId] || [];
      
      const orderedTasks = orderedTaskIds
        .map((taskId) => tasks.find((t) => t.id === taskId))
        .filter(Boolean) as Task[];

      return {
        status,
        statusId,
        tasks: orderedTasks,
        color: getStatusColor(status),
      };
    });
  }, [tasks, statuses, tableOrderMaps]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
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
      const sourceColumnId = sourceGroup.statusId;
      const destColumnId = destGroup.statusId;

      const queryKey = taskKeys.byProject(currentProjectId as string, uid);

      const destinationStatus = statuses.find((s) => s.id === destColumnId);
      const isDoneStatus =
        destinationStatus?.name.toLowerCase() === "done" ||
        destinationStatus?.name.toLowerCase() === "completed";

      // Cập nhật tableOrderMaps
      setTableOrderMaps((prevMaps) => {
        const newMaps = { ...prevMaps };
        const sourceArray = [...(newMaps[sourceColumnId] || [])];
        const destArray =
          sourceColumnId === destColumnId
            ? sourceArray
            : [...(newMaps[destColumnId] || [])];

        const taskIdToMove = sourceArray[source.index];
        sourceArray.splice(source.index, 1);

        if (sourceColumnId === destColumnId) {
          sourceArray.splice(destination.index, 0, taskIdToMove);
          newMaps[sourceColumnId] = sourceArray;
        } else {
          destArray.splice(destination.index, 0, taskIdToMove);
          newMaps[sourceColumnId] = sourceArray;
          newMaps[destColumnId] = destArray;
        }
        return newMaps;
      });

      let pendingUpdates: Array<{
        id: string;
        statusId?: string;
        position: number;
      }> = [];

      // Cập nhật tasks trong cache
      queryClient.setQueryData<Task[]>(queryKey, (oldTasks) => {
        if (!oldTasks) return oldTasks;

        const newTasks = oldTasks.map((t) => ({ ...t }));

        const sourceArray = [...(tableOrderMaps[sourceColumnId] || [])];
        const destArray =
          sourceColumnId === destColumnId
            ? sourceArray
            : [...(tableOrderMaps[destColumnId] || [])];

        const taskIdToMove = sourceArray[source.index];
        sourceArray.splice(source.index, 1);

        if (sourceColumnId === destColumnId) {
          sourceArray.splice(destination.index, 0, taskIdToMove);
        } else {
          destArray.splice(destination.index, 0, taskIdToMove);
        }

        const tasksToUpdate: Array<{
          id: string;
          statusId?: string;
          position: number;
        }> = [];

        // Cập nhật source column positions
        if (sourceColumnId !== destColumnId) {
          sourceArray.forEach((taskId, index) => {
            const task = newTasks.find((t) => t.id === taskId);
            if (task) {
              const newPosition = index + 1;
              if (task.position !== newPosition) {
                task.position = newPosition;
                tasksToUpdate.push({
                  id: taskId,
                  position: newPosition,
                });
              }
            }
          });
        }

        // Cập nhật dest column positions
        const arrayToProcess =
          sourceColumnId === destColumnId ? sourceArray : destArray;
        arrayToProcess.forEach((taskId, index) => {
          const task = newTasks.find((t) => t.id === taskId);
          if (task) {
            const newPosition = index + 1;

            if (taskId === draggableId) {
              task.position = newPosition;
              if (sourceColumnId !== destColumnId) {
                task.statusId = destColumnId;
                tasksToUpdate.push({
                  id: taskId,
                  statusId: destColumnId,
                  position: newPosition,
                });
              } else {
                tasksToUpdate.push({
                  id: taskId,
                  position: newPosition,
                });
              }
            } else if (task.position !== newPosition) {
              task.position = newPosition;
              tasksToUpdate.push({
                id: taskId,
                position: newPosition,
              });
            }
          }
        });
        pendingUpdates = tasksToUpdate;

        return newTasks;
      });

      if (isDoneStatus) {
        setTimeout(() => {
          triggerConfetti();
          notifications.show({
            title: "Task Completed!",
            message: "Congratulations on completing this task!",
            color: "green",
          });
        }, 0);
      }

      // Call API
      try {
        if (pendingUpdates.length === 0) {
          return;
        }

        await Promise.all(
          pendingUpdates.map(async (update) => {
            const updateData: UpdateTaskDto = {
              position: update.position,
            };

            if (update.statusId) {
              updateData.statusId = update.statusId;
            }

            await updateTask({ 
              id: update.id, 
              data: updateData
            });
          })
        );
      } catch (error) {
        queryClient.invalidateQueries({ queryKey });
        notifications.show({
          title: "Update Failed",
          message: "Failed to save changes. Please try again.",
          color: "red",
        });
      }
    },
    [
      tableOrderMaps,
      currentProjectId,
      queryClient,
      statuses,
      taskGroups,
      tasks,
      updateTask,
      uid,
    ]
  );

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