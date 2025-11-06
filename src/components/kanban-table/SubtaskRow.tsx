"use client";
import { Table, Group, Box, Text, Badge, Menu, ActionIcon } from "@mantine/core";
import { IconDots, IconEye } from "@tabler/icons-react";
import { Task } from "@/types/api";
import { getPriorityColor, formatDeadline } from "./utils";

interface SubtaskRowProps {
  subtask: Task;
  onViewTask: (task: Task) => void;
}

export function SubtaskRow({ subtask, onViewTask }: SubtaskRowProps) {
  return (
    <Table.Tr
      style={{
        backgroundColor: "var(--monday-bg-card)",
        borderLeft: "3px solid #0073EA",
      }}
    >
      <Table.Td>
        <Group gap="sm" align="center" ml={40}>
          <Box
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: "#0073EA",
            }}
          />
          <div>
            <Text fw={500} size="sm" c="dimmed">
              {subtask.name}
            </Text>
            {subtask.description && (
              <Text size="xs" c="dimmed" className="truncate max-w-[180px]">
                {subtask.description}
              </Text>
            )}
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color="blue" variant="dot" size="md">
          Subtask
        </Badge>
      </Table.Td>
      <Table.Td>
        {subtask.priority && (
          <Badge
            color={getPriorityColor(subtask.priority)}
            variant="outline"
            size="sm"
          >
            {subtask.priority?.toUpperCase()}
          </Badge>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {subtask.assignees && subtask.assignees.length > 0
            ? subtask.assignees.map((a) => a.user.name).join(", ")
            : "-"}
        </Text>
      </Table.Td>
      <Table.Td>{formatDeadline(subtask.deadline)}</Table.Td>
      <Table.Td>
        <Text size="sm">
          {subtask.actualTime !== undefined && subtask.actualTime > 0
            ? `${subtask.actualTime}h`
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
              onClick={() => onViewTask(subtask)}
            >
              View
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
}