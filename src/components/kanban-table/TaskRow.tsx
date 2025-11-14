"use client";
import { Table, Group, Box, Text, Badge, Menu, ActionIcon, Tooltip } from "@mantine/core";
import {
  IconDots,
  IconEye,
  IconGripVertical,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { Draggable } from "@hello-pangea/dnd";
import { Task } from "@/types/api";
import { SubtaskRow } from "./SubtaskRow";
import { getPriorityColor, formatDeadline } from "@/lib/utils";
import { useGetSubtasks } from "@/hooks/task";

interface TaskRowProps {
  task: Task;
  index: number;
  groupStatus: string;
  isExpanded: boolean;
  onViewTask: (task: Task) => void;
  onToggleExpansion: (taskId: string, e: React.MouseEvent) => void;
}

export function TaskRow({
  task,
  index,
  groupStatus,
  isExpanded,
  onViewTask,
  onToggleExpansion,
}: TaskRowProps) {
  const { data: subtasks = []} = useGetSubtasks(task.id);
  const hasSubtasks = subtasks.length > 0;

  return (
    <>
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <Table.Tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`${
              snapshot.isDragging ? "bg-gray-50 opacity-80" : "opacity-100"
            } transition-all`}
            style={provided.draggableProps.style}
          >
            <Table.Td>
              <Group gap="sm" align="center">
                <div
                  {...provided.dragHandleProps}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <IconGripVertical size={16} color="#999" />
                </div>
                {hasSubtasks && (
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={(e) => onToggleExpansion(task.id, e)}
                    color="blue"
                  >
                    {isExpanded ? (
                      <IconChevronDown size={16} />
                    ) : (
                      <IconChevronRight size={16} />
                    )}
                  </ActionIcon>
                )}
                {!hasSubtasks && <Box style={{ width: 28 }} />}
                <div>
                  <Text fw={500} size="sm" className="truncate max-w-[200px]">
                    {task.name}
                  </Text>
                  {task.description && (
                    <Text
                      size="xs"
                      c="dimmed"
                      className="truncate max-w-[200px]"
                    >
                      {task.description}
                    </Text>
                  )}
                </div>
              </Group>
            </Table.Td>
            <Table.Td>
              {hasSubtasks ? (
                <Tooltip label={`${subtasks.length} subtask(s)`}>
                  <Badge
                    color="blue"
                    variant="light"
                    size="md"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => onToggleExpansion(task.id, e)}
                  >
                    {subtasks.length}
                  </Badge>
                </Tooltip>
              ) : (
                <Text size="sm" c="dimmed">
                  -
                </Text>
              )}
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
      {isExpanded && hasSubtasks && (
        <>
          {subtasks.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              onViewTask={onViewTask}
            />
          ))}
        </>
      )}
    </>
  );
}