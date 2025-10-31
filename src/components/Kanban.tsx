"use client";
import { Dispatch, SetStateAction, useRef, useEffect, memo } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Button, TextInput, Paper } from "@mantine/core";
import { IconPlus, IconX, IconCheck } from "@tabler/icons-react";
import KanbanColumn from "./KanbanColumn";

interface KanbanProps {
  columns: any[];
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

export default memo(function Kanban({
  columns,
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
  const addListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAddingColumn && addListRef.current) {
      addListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "end",
      });
    }
  }, [isAddingColumn]);

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
    <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{
            display: "flex",
            gap: "16px",
            overflowX: "auto",
            height: "calc(100% - 8px)",
            width: "100%",
            alignItems: "stretch",
            scrollPadding: "12px",
            flexGrow: 1,
          }}
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

          <div ref={addListRef} className="flex-shrink-0">
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
  );
});