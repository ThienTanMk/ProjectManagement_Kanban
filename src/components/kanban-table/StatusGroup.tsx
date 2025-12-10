"use client";
import { Paper, Group, Badge, Text } from "@mantine/core";
import { Droppable } from "@hello-pangea/dnd";
import { Task } from "@/types/api";
import { TaskTable } from "./TaskTable";

interface StatusGroupProps {
  status: string;
  color: string;
  tasks: Task[];
  expandedTasks: Record<string, boolean>;
  onViewTask: (task: Task) => void;
  onToggleExpansion: (taskId: string, e: React.MouseEvent) => void;
}

export function StatusGroup({
  status,
  color,
  tasks,
  expandedTasks,
  onViewTask,
  onToggleExpansion,
}: StatusGroupProps) {
  return (
    <Paper
      shadow="sm"
      p="md"
      className="rounded-lg shadow-sm transition-all"
      style={{
        backgroundColor: "var(--monday-bg-card)",
        border: `1px solid var(--monday-border-primary)`,
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Badge
            color={color}
            variant="light"
            size="lg"
            style={{ fontWeight: 600 }}
          >
            {status}
          </Badge>
          <Text size="sm" c="var(--monday-text-secondary)">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </Text>
        </Group>
      </Group>

      <Droppable droppableId={`table-${status}`}>
        {(provided, snapshot) => (
          <div
            style={{
              backgroundColor: snapshot.isDraggingOver
                ? `var(--monday-bg-active)`
                : "transparent",
              borderRadius: "4px",
              minHeight: tasks.length === 0 ? "60px" : "auto",
              padding: snapshot.isDraggingOver ? "8px" : "0",
              transition: "all 0.2s ease",
            }}
          >
            {tasks.length > 0 ? (
              <TaskTable
                tasks={tasks}
                groupStatus={status}
                expandedTasks={expandedTasks}
                onViewTask={onViewTask}
                onToggleExpansion={onToggleExpansion}
                droppableProvided={provided}
              />
            ) : (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  border: snapshot.isDraggingOver
                    ? `2px dashed var(--mantine-color-${color}-4)`
                    : `1px dashed var(--monday-border-primary)`,
                  borderRadius: "8px",
                  backgroundColor: snapshot.isDraggingOver
                    ? "var(--monday-bg-hover)"
                    : "var(--monday-bg-card)",
                }}
              >
                <Text c="var(--monday-text-secondary)" size="sm">
                  {snapshot.isDraggingOver
                    ? `Drop task here to move to ${status}`
                    : `No tasks in ${status}`}
                </Text>
                {provided.placeholder}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </Paper>
  );
}