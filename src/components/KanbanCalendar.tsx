"use client";
import { useState, useMemo } from "react";
import clsx from "clsx";
import {
  Paper,
  Text,
  Group,
  Badge,
  ActionIcon,
  Stack,
  Box,
  Grid,
  Select,
  Modal,
  Popover,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import dayjs from "dayjs";
import TaskCard from "./TaskCard";
import { Task } from "@/types/api";

interface KanbanCalendarProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onTaskDeadlineChange?: (taskId: string, deadline: string | null) => void;
  onOpenAddTask?: (deadline: string | null) => void;
}

export default function KanbanCalendar({
  tasks,
  onViewTask,
  onTaskDeadlineChange,
  onOpenAddTask,
}: KanbanCalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [moreTasksModalOpened, setMoreTasksModalOpened] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState<dayjs.Dayjs | null>(null);

  const daysInView = useMemo(() => {
    if (viewMode === "month") {
      const startOfMonth = currentDate.startOf("month");
      const endOfMonth = currentDate.endOf("month");
      const startDay = startOfMonth.day(); // 0 = Sunday
      const totalDays = endOfMonth.date();
      const weeks = Math.ceil((totalDays + startDay) / 7);

      const days: dayjs.Dayjs[] = [];
      for (let i = 0; i < weeks * 7; i++) {
        const day = startOfMonth.add(i - startDay, "day");
        days.push(day);
      }
      return days;
    } else {
      // week view
      const startOfWeek = currentDate.startOf("week"); // Sunday start
      const days: dayjs.Dayjs[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(startOfWeek.add(i, "day"));
      }
      return days;
    }
  }, [currentDate, viewMode]);

  const taskGroups = useMemo(() => {
    const groups: Record<string, Task[]> = { unscheduled: [] };
    tasks.forEach((task) => {
      if (!task.deadline) {
        groups.unscheduled.push(task);
      } else {
        const parsedDeadline = dayjs(task.deadline);
        if (parsedDeadline.isValid()) {
          const dateKey = parsedDeadline.format("YYYY-MM-DD");
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(task);
        } else {
          groups.unscheduled.push(task);
        }
      }
    });
    return groups;
  }, [tasks]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !onTaskDeadlineChange) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (destination.droppableId === "unscheduled") {
      onTaskDeadlineChange(draggableId, null);
      return;
    }

    if (destination.droppableId.startsWith("calendar-day-")) {
      const newDateKey = destination.droppableId.replace("calendar-day-", "");
      const parsedNewDate = dayjs(newDateKey);
      if (parsedNewDate.isValid()) {
        onTaskDeadlineChange(draggableId, parsedNewDate.toISOString());
      }
    }
  };

  const openMoreTasks = (day: dayjs.Dayjs, tasks: Task[]) => {
    setSelectedDay(day);
    setSelectedDayTasks(tasks);
    setMoreTasksModalOpened(true);
  };

  const CalendarDay = ({ day }: { day: dayjs.Dayjs }) => {
    const isInViewPeriod =
      viewMode === "month"
        ? day.month() === currentDate.month()
        : day.isSame(currentDate, "week");

    const dateKey = day.format("YYYY-MM-DD");
    const dayTasks = taskGroups[dateKey] || [];
    const moreCount = dayTasks.length - 1; // số task còn lại

    return (
      <Droppable droppableId={`calendar-day-${dateKey}`}>
        {(provided, snapshot) => {
          const visibleTasks =
            snapshot.isDraggingOver || snapshot.draggingFromThisWith
              ? dayTasks
              : dayTasks.slice(0, 1);

          return (
            <Paper
              shadow="xs"
              p="xs"
              className={clsx(
                "group relative min-h-[150px] p-2 rounded-md shadow-sm transition-all duration-200 cursor-pointer",
                snapshot.isDraggingOver ? "bg-gray-100" : "bg-white",
                isInViewPeriod ? "opacity-100" : "opacity-50",
                "hover:scale-[1.03] hover:shadow-md"
              )}
              ref={provided.innerRef}
              {...provided.droppableProps}
              onClick={() => onOpenAddTask?.(day.toISOString())}
            >
              <Text size="sm" fw={500}>
                {day.date()}
              </Text>

              {/* Danh sách task */}
              <Stack gap="xs" mt="xs">
                {visibleTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard
                          card={task}
                          onViewTask={onViewTask}
                          isCalendarView={true}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Stack>

              {/* Hiện thêm task nếu còn */}
              {moreCount > 0 && (
                <Group
                  mt="md"
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn click lan lên Paper
                    openMoreTasks(day, dayTasks);
                  }}
                  className="rounded-md transition-colors duration-150 px-2 py-1 cursor-pointer hover:bg-gray-600"
                >
                  <Text size="xs" fw={500}>
                    Task: {moreCount} more
                  </Text>
                </Group>
              )}
            </Paper>
          );
        }}
      </Droppable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {taskGroups.unscheduled.length > 0 && (
        <Droppable droppableId="unscheduled">
          {(provided) => (
            <Paper
              shadow="md"
              p="md"
              mb="md"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600} c="dimmed">
                  📋 Unscheduled Tasks
                </Text>
                <Badge size="sm" variant="light" color="gray">
                  {taskGroups.unscheduled.length}
                </Badge>
              </Group>
              <Group gap="xs" wrap="nowrap" style={{ overflowX: "auto" }}>
                {taskGroups.unscheduled.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard
                          card={task}
                          // index={index}
                          onViewTask={onViewTask}
                          isCalendarView={true}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Group>
            </Paper>
          )}
        </Droppable>
      )}

      <Group justify="space-between" mb="md">
        <Group>
          <ActionIcon
            onClick={() => setCurrentDate(currentDate.subtract(1, viewMode))}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Text fw={700}>
            {currentDate.format(
              viewMode === "month" ? "MMMM YYYY" : "MMM DD, YYYY [Week]"
            )}
          </Text>
          <ActionIcon
            onClick={() => setCurrentDate(currentDate.add(1, viewMode))}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
        <Select
          value={viewMode}
          onChange={(value) => setViewMode(value as "month" | "week")}
          data={[
            { value: "month", label: "Month" },
            { value: "week", label: "Week" },
          ]}
        />
      </Group>

      <Grid columns={7} gutter="xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Grid.Col key={day} span={1}>
            <Text size="xs" fw={700} ta="center">
              {day}
            </Text>
          </Grid.Col>
        ))}
        {daysInView.map((day, idx) => (
          <Grid.Col key={idx} span={1}>
            <CalendarDay day={day} />
          </Grid.Col>
        ))}
      </Grid>

      {selectedDay && moreTasksModalOpened && (
        <Popover
          opened={moreTasksModalOpened}
          onChange={setMoreTasksModalOpened}
          position="bottom"
          width={320}
          withinPortal
          zIndex={100}
        >
          <Popover.Target>
            <Box
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            />
          </Popover.Target>
          <Popover.Dropdown
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              // zIndex: 100,
            }}
          >
            <Stack gap="xs" p="xs">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600}>
                  {selectedDay.format("dddd, MMMM DD")}
                </Text>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => setMoreTasksModalOpened(false)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Group>
              <Droppable
                droppableId={`calendar-day-${selectedDay.format("YYYY-MM-DD")}`}
              >
                {(provided) => (
                  <Stack
                    gap="xs"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: 100 }}
                  >
                    {selectedDayTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              opacity: dragSnapshot.isDragging ? 0.7 : 1,
                            }}
                          >
                            <TaskCard
                              card={task}
                              onViewTask={onViewTask}
                              isCalendarView={true}
                              isDragging={dragSnapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      )}
    </DragDropContext>
  );
}
