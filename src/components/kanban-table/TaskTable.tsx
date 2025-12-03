"use client";
import { Table } from "@mantine/core";
import { Task } from "@/types/api";
import { TaskRow } from "./TaskRow";

interface TaskTableProps {
  tasks: Task[];
  groupStatus: string;
  expandedTasks: Record<string, boolean>;
  onViewTask: (task: Task) => void;
  onToggleExpansion: (taskId: string, e: React.MouseEvent) => void;
  placeholder?: React.ReactElement;
}

export function TaskTable({
  tasks,
  groupStatus,
  expandedTasks,
  onViewTask,
  onToggleExpansion,
  placeholder,
}: TaskTableProps) {
  return (
    <Table
      highlightOnHover={false}
      className="
        [&_thead_tr_th]:bg-[var(--monday-bg-tertiary)]
        [&_tbody_tr]:transition-colors
        [&_tbody_tr:hover]:bg-[var(--monday-bg-hover)] 
        [&_th]:text-[var(--monday-text-secondary)] 
        [&_td]:text-[var(--monday-text-primary)] 
        border-collapse
      "
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th className="w-[30%]">Task</Table.Th>
          <Table.Th className="w-[10%]">Subtasks</Table.Th>
          <Table.Th className="w-[10%]">Priority</Table.Th>
          <Table.Th className="w-[15%]">Assignees</Table.Th>
          <Table.Th className="w-[15%]">Deadline</Table.Th>
          <Table.Th className="w-[15%]">Actual Time</Table.Th>
          <Table.Th className="w-[10%]">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            index={index}
            groupStatus={groupStatus}
            isExpanded={expandedTasks[task.id] || false}
            onViewTask={onViewTask}
            onToggleExpansion={onToggleExpansion}
          />
        ))}
        {placeholder}
      </Table.Tbody>
    </Table>
  );
}