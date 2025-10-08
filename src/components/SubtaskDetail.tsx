"use client";
import { Stack, Group, Text, Badge, Paper, ActionIcon, Tooltip } from "@mantine/core";
import { IconChevronDown, IconChevronRight, IconClock } from "@tabler/icons-react";
import { JSX, useState } from "react";
import dayjs from "dayjs";
import { Task } from "@/types/api";

interface SubtaskTreeProps {
  subtasks: Task[];
  onTaskClick: (task: Task) => void;
}

interface TreeNode extends Task {
  children?: TreeNode[];
}

// Build tree structure from flat list
const buildTree = (tasks: Task[]): TreeNode[] => {
  const taskMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  // First pass: Create map of all tasks
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Second pass: Build tree structure
  // TODO: Replace this logic when you have parentId from API
  // For now, using hardcoded structure based on naming convention
  tasks.forEach(task => {
    const node = taskMap.get(task.id);
    if (!node) return;

    // Hardcoded logic: tasks with 'child' in id are children of 'root' tasks
    // Replace this when you have actual parentId field
    if (task.id.includes('child')) {
      const parentId = task.id.replace('child', 'root').split('-').slice(0, 3).join('-');
      const parent = taskMap.get(parentId);
      if (parent && parent.children) {
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
};

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

export default function SubtaskTree({ subtasks, onTaskClick }: SubtaskTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const tree = buildTree(subtasks);

  const renderNode = (node: TreeNode, depth = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id] || false;

    return (
      <div key={node.id} style={{ marginLeft: depth * 20 }}>
        <Paper
          shadow="xs"
          p="md"
          mb="sm"
          withBorder
          style={{
            cursor: "pointer",
            backgroundColor: depth === 0 ? "#f8f9fa" : "#ffffff",
            borderLeft: depth > 0 ? "3px solid #228be6" : undefined,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e7f5ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = depth === 0 ? "#f8f9fa" : "#ffffff";
          }}
          onClick={() => onTaskClick(node)}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" style={{ flex: 1 }}>
              {hasChildren && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={(e) => toggleExpand(node.id, e)}
                  color="blue"
                >
                  {isExpanded ? (
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </ActionIcon>
              )}
              {!hasChildren && <div style={{ width: 28 }} />}
              
              <div style={{ flex: 1 }}>
                <Text fw={500} size="sm" mb={4}>
                  {node.name}
                </Text>
                {node.description && (
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {node.description}
                  </Text>
                )}
              </div>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <Badge color={getPriorityColor(node.priority)} size="sm">
                {node.priority}
              </Badge>
              
              {node.deadline && (
                <Tooltip label={`Deadline: ${dayjs(node.deadline).format("MMM D, YYYY")}`}>
                  <Group gap={4}>
                    <IconClock size={14} />
                    <Text size="xs" c="dimmed">
                      {dayjs(node.deadline).format("MMM D")}
                    </Text>
                  </Group>
                </Tooltip>
              )}
              
              {node.actualTime && node.actualTime > 0 && (
                <Badge variant="light" color="blue" size="sm">
                  {node.actualTime}h
                </Badge>
              )}
            </Group>
          </Group>
        </Paper>

        {isExpanded && hasChildren && (
          <div style={{ marginTop: 8 }}>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Stack gap="md">
      {tree.length > 0 ? (
        tree.map((node) => renderNode(node))
      ) : (
        <Text ta="center" c="dimmed" py="xl">
          No subtasks available
        </Text>
      )}
    </Stack>
  );
}