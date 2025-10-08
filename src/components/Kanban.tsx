"use client";
import { Dispatch, SetStateAction } from "react";
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { Button, TextInput, Paper } from "@mantine/core";
import { IconPlus, IconX, IconCheck } from "@tabler/icons-react";
import KanbanColumn from "./KanbanColumn";
interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}
interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  attachments?: FileAttachment[];
}
interface HistoryEntry {
  id: string;
  action: string;
  author: string;
  createdAt: string;
  details?: string;
}
interface Task {
  id: string;
  content: string;
  title?: string;
  description?: string;
  priority?: string;
  assignees?: string[];
  authors?: string[];
  status: string;
  tags?: string[];
  comments?: Comment[];
  history?: HistoryEntry[];
  createdAt?: string;
  deadline?: string;
  actualTime?: number;
}
interface Column {
  id: string;
  title: string;
  cards: Task[];
}
interface KanbanProps {
  columns: any[];
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: any) => void;
  onViewTask: (task: any) => void;
  onAddTask: (columnId: string) => void;
  onAddColumn: () => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  isAddingColumn: boolean;
  setIsAddingColumn: Dispatch<SetStateAction<boolean>>;
  newColumnTitle: string;
  setNewColumnTitle: Dispatch<SetStateAction<string>>;
  canEditTasks?: boolean;
  canDragTasks?: boolean;
}
export default function Kanban({
  columns,
  onDragEnd,
  onViewTask,
  onAddTask,
  onAddColumn,
  onDeleteColumn,
  onRenameColumn,
  isAddingColumn,
  setIsAddingColumn,
  newColumnTitle,
  setNewColumnTitle,
  canEditTasks = true,
  canDragTasks = true,
}: KanbanProps) {

  console.log('123');
  
  const handleAddColumnSubmit = () => {
    if (newColumnTitle.trim()) {
      onAddColumn();
      setIsAddingColumn(false);
      setNewColumnTitle("");
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleAddColumnSubmit();
    } else if (event.key === "Escape") {
      setIsAddingColumn(false);
      setNewColumnTitle("");
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="py-4 flex gap-4 overflow-x-auto min-h-[70vh]"
          >
            {columns.map((column, index) => (
              <Draggable
                key={column.id}
                draggableId={column.id}
                index={index}
                isDragDisabled={!canDragTasks}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex-shrink-0 ${
                      snapshot.isDragging ? "opacity-80" : ""
                    }`}
                  >
                    <KanbanColumn
                      column={column}
                      onViewTask={onViewTask}
                      onAddTask={() => onAddTask(column.id)}
                      onDeleteColumn={() => onDeleteColumn(column.id)}
                      onRenameColumn={(newTitle) =>
                        onRenameColumn(column.id, newTitle)
                      }
                      dragHandleProps={provided.dragHandleProps}
                      canEditTasks={canEditTasks}
                      canDragTasks={canDragTasks}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <div className="min-w-[280px] flex-shrink-0">
              {isAddingColumn ? (
                <Paper p="md" shadow="sm" style={{ minWidth: "280px" }}>
                  <TextInput
                    placeholder="Enter list title..."
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    data-autofocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="xs"
                      onClick={handleAddColumnSubmit}
                      leftSection={<IconCheck size={14} />}
                    >
                      Add list
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle("");
                      }}
                      leftSection={<IconX size={14} />}
                    >
                      Cancel
                    </Button>
                  </div>
                </Paper>
              ) : (
                canEditTasks && (
                  <Button
                    variant="light"
                    color="gray"
                    size="md"
                    className="w-full h-12 justify-start"
                    onClick={() => setIsAddingColumn(true)}
                    leftSection={<IconPlus size={16} />}
                  >
                    Add a list
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
