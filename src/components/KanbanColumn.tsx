"use client";
import { useState } from "react";
import {
  Paper,
  Text,
  Group,
  Badge,
  Button,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
} from "@mantine/core";
import { Droppable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import {
  IconPlus,
  IconGripVertical,
  IconDots,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import TaskCard from "./TaskCard";
import { Task } from "@/types/api";

interface Column {
  id: string;
  title: string;
  cards: Task[];
}
interface KanbanColumnProps {
  column: Column;
  onViewTask: (task: Task) => void;
  onAddTask: () => void;
  onDeleteColumn?: () => void;
  onRenameColumn?: (newTitle: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  canEditTasks?: boolean;
  canDragTasks?: boolean;
}
export default function KanbanColumn({
  column,
  onViewTask,
  onAddTask,
  onDeleteColumn,
  onRenameColumn,
  dragHandleProps,
  canEditTasks = true,
  canDragTasks = true,
}: KanbanColumnProps) {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);

  const handleRename = () => {
    if (newTitle.trim() && onRenameColumn) {
      onRenameColumn(newTitle.trim());
      setIsRenameModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (onDeleteColumn) {
      onDeleteColumn();
    }
  };
  return (
    <>
      <Paper
        key={column.id}
        shadow="md"
        radius="md"
        p="md"
        className="bg-gray-100 min-w-[240px] w-[240px] border border-[#e0e0e0] rounded-md shadow-sm"
      >
        <Group justify="space-between" mb="md">
          <Group gap="xs" style={{ flex: 1 }}>
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing"
            >
              <IconGripVertical size={16} color="#666" />
            </div>
            <Text fw={700} size="lg" style={{ flex: 1 }}>
              {column.title}
            </Text>
          </Group>
          <Group gap="xs">
            <Badge variant="outline" size="sm">
              {column.cards.length}
            </Badge>
            {canEditTasks && (
              <Menu shadow="md" width={150}>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={() => {
                      setNewTitle(column.title);
                      setIsRenameModalOpen(true);
                    }}
                  >
                    Rename
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={handleDelete}
                    disabled={column.cards.length > 0}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
        <Droppable droppableId={column.id}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-2 min-h-[100px]"
            >
              {column.cards.map((card, idx) => (
                <TaskCard
                  key={card.id}
                  card={card}
                  index={idx}
                  onViewTask={onViewTask}
                  canDragTasks={canDragTasks}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {canEditTasks && (
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            fullWidth
            mt="md"
            onClick={onAddTask}
          >
            Add Task
          </Button>
        )}
      </Paper>

      {/* Rename Modal */}
      <Modal
        opened={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Column"
        size="sm"
        centered
      >
        <TextInput
          label="Column Name"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter column name"
          data-autofocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRename();
            } else if (e.key === "Escape") {
              setIsRenameModalOpen(false);
            }
          }}
        />
        <Group justify="end" mt="md">
          <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={!newTitle.trim() || newTitle.trim() === column.title}
          >
            Rename
          </Button>
        </Group>
      </Modal>
    </>
  );
}
