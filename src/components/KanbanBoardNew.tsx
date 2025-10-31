"use client";
import { useState, useMemo, useCallback } from "react";
import {
  Group,
  SegmentedControl,
  Button,
  TextInput,
  Select,
  Badge,
  Loader,
  Alert,
  Container,
  Text,
  Drawer,
  Box,
  Paper,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconX,
  IconAlertCircle,
  IconUsersGroup,
  IconList,
  IconClock,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import AddTaskModal from "./AddTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import KanbanTableView from "./KanbanTableView";
import KanbanCalendar from "./KanbanCalendar";
import ProjectMember from "./ProjectMember";
import Summary from "./Summary";
import Kanban from "./Kanban";
import { useProjectStore } from "../stores/projectStore";
import {
  useCreateTask,
  useTasksByProject,
  useUpdateTaskStatus,
  useUpdateTask,
  taskKeys,
} from "../hooks/task";
import {
  useAddStatus,
  useGetStatuses,
  useUpdateStatus,
  useDeleteStatus,
} from "@/hooks/status";
import { Task, CreateTaskDto } from "@/types/api";
import { unionBy } from "lodash";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetTeamMembers } from "@/hooks/project";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";

interface Column {
  id: string;
  title: string;
  cards: Task[];
}

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const { currentProjectId } = useProjectStore();
  const { canEditTasks, canDragTasks } = usePermissions();

  const { data: statuses = [] } = useGetStatuses();
  const { mutateAsync: addStatus } = useAddStatus();
  const { mutateAsync: updateStatus } = useUpdateStatus();
  const { mutateAsync: deleteStatus } = useDeleteStatus();

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasksByProject(currentProjectId as string);

  const { mutateAsync: createTask } = useCreateTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();

  const [view, setView] = useState<"summary" | "board" | "table" | "calendar">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [addTaskModalOpened, setAddTaskModalOpened] = useState(false);
  const [initialDeadline, setInitialDeadline] = useState<string | null>(null); // giữ lại ngày ban đầu khi thêm task ở calendar
  const [taskDetailModalOpened, setTaskDetailModalOpened] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [addTaskToColumnId, setAddTaskToColumnId] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  
  const { data: teamMembers = [] } = useGetTeamMembers();

  const columns: Column[] = useMemo(() => {
    if (statuses.length > 0) {
      return statuses.map((status) => ({
        id: status.id,
        title: status.name,
        cards: tasks?.filter((task) => task.statusId === status.id) || [],
      }));
    } else {
      return [
        {
          id: "todo",
          title: "To Do",
          cards: tasks?.filter((task) => task.statusId === "todo") || [],
        },
        {
          id: "inprogress",
          title: "In Progress",
          cards: tasks?.filter((task) => task.statusId === "inprogress") || [],
        },
        {
          id: "done",
          title: "Done",
          cards: tasks?.filter((task) => task.statusId === "done") || [],
        },
      ];
    }
  }, [statuses, tasks]);


  const filteredColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      cards: column.cards.filter((task) => {
        const matchesSearch = task.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = !selectedPriority || task.priority === selectedPriority;
        const matchesAssignee =
          !selectedAssignee || task.assignees?.map((a) => a.user.id).includes(selectedAssignee);
        const matchesCreator = !selectedCreator || task.ownerId === selectedCreator;
        return matchesSearch && matchesPriority && matchesAssignee;
      }),
    }));
  }, [columns, searchTerm, selectedPriority, selectedAssignee, selectedCreator]);

  const allTasks = columns.flatMap((col) => col.cards);
  const priorities = unionBy(allTasks.flatMap((task) => task.priority), (o) => o);
  const assignees = unionBy(allTasks.flatMap((task) => task.assignees || []), (o) => o.userId);
  const creators = unionBy(allTasks.flatMap((task) => (task.owner ? [task.owner] : [])), (o) => o.id);

  const statistics = useMemo(() => {
    const totalTasks = allTasks.length;
    const dueSoonTasks = allTasks.filter((task) => {
      if (!task.deadline) return false;
      const daysUntil = dayjs(task.deadline).diff(dayjs(), "day");
      return daysUntil >= 0 && daysUntil <= 3;
    }).length;

    return { total: totalTasks, dueSoon: dueSoonTasks };
  }, [allTasks]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!canDragTasks) return;

    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Update cache ngay lập tức (không chờ API)
    const queryKey = taskKeys.byProject(currentProjectId as string);
    
    queryClient.setQueryData<Task[]>(queryKey, (oldTasks) => {
      if (!oldTasks) return oldTasks;
      
      return oldTasks.map(task => 
        task.id === draggableId 
          ? { ...task, statusId: destination.droppableId }
          : task
      );
    });

    // API call chạy background
    updateTaskStatus(
      { id: draggableId, statusId: destination.droppableId },
      {
        onError: () => {
          // Rollback khi fail
          queryClient.invalidateQueries({ queryKey });
        },
      }
    );
  }, [canDragTasks, currentProjectId, queryClient, updateTaskStatus]);

  const handleAddTask = async (data: CreateTaskDto) => {
    try {
      await createTask({
        ...data,
        statusId: addTaskToColumnId || statuses?.[0]?.id || "",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
    setAddTaskToColumnId(null);
    setAddTaskModalOpened(false);
  };

  const handleAddTaskToColumn = useCallback((columnId: string) => {
    setAddTaskToColumnId(columnId);
    setAddTaskModalOpened(true);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpened(true);
  }, []);

  const handleAddColumn = async () => {
    const trimmedTitle = newColumnTitle.trim();
    if (!trimmedTitle) return;

    // const defaultNames = ["to do", "in progress", "done"];
    // if (defaultNames.includes(trimmedTitle.toLowerCase())) {
    //   notifications.show({
    //     title: "Duplicate name",
    //     message: "Tên này trùng với danh sách mặc định (To Do / In Progress / Done).",
    //     color: "red",
    //   });
    //   return;
    // }

    const isDuplicate = columns.some(
      (col) => col.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
    );
    if (isDuplicate) {
      notifications.show({
        title: "Duplicate name",
        message: "Danh sách này đã tồn tại.",
        color: "red",
      });
      return;
    }

    try {
      await addStatus(trimmedTitle);
      setNewColumnTitle("");
      setIsAddingColumn(false);
      notifications.show({
        title: "Success",
        message: "Tạo danh sách mới thành công!",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to add column:", error);
      notifications.show({
        title: "Error",
        message: "Không thể tạo danh sách. Vui lòng thử lại.",
        color: "red",
      });
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = statuses?.find((s) => s.id === columnId);
    const tasksInColumn = tasks?.filter((task) => task.statusId === columnId) || [];

    if (tasksInColumn.length > 0) {
      modals.openConfirmModal({
        title: "Cannot Delete Column",
        children: (
          <Text size="sm">
            This column contains {tasksInColumn.length} task(s). Please move or delete all tasks
            before deleting the column.
          </Text>
        ),
        labels: { confirm: "OK", cancel: "Cancel" },
        onConfirm: () => {},
      });
      return;
    }

    modals.openConfirmModal({
      title: "Delete Column",
      children: (
        <Text size="sm">
          Are you sure you want to delete "{column?.name}"? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteStatus(columnId);
        } catch (error) {
          console.error("Failed to delete column:", error);
        }
      },
    });
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
    try {
      await updateStatus({ id: columnId, name: newTitle });
    } catch (error) {
      console.error("Failed to rename column:", error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, statusId: newStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriority(null);
    setSelectedAssignee(null);
    setSelectedCreator(null);
  };

  const hasActiveFilters = searchTerm || selectedPriority || selectedAssignee || selectedCreator;

  if (tasksLoading) {
    return (
      <Container fluid>
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  if (tasksError) {
    return (
      <Container fluid>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error Loading Tasks"
          color="red"
          variant="light"
        >
          {tasksError.toString()}
          <Button mt="sm" size="xs" onClick={() => refetchTasks()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!currentProjectId) {
    return (
      <Container fluid>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="No Project Selected"
          color="blue"
          variant="light"
        >
          Please select a project from the sidebar to view tasks.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 150px)",
      }}
    >
      {/* Filters */}
      <Paper
        p="md"
        mb="md"
        radius="md"
        style={{
          backgroundColor: "var(--monday-bg-secondary)",
          border: "1px solid var(--monday-border-primary)",
        }}
      >
        <Group justify="space-between" mb="md">
          <SegmentedControl
            value={view}
            onChange={(value) =>
              setView(value as "summary" | "board" | "table" | "calendar")
            }
            data={[
              { label: "Summary", value: "summary" },
              { label: "Board View", value: "board" },
              { label: "Table View", value: "table" },
              { label: "Calendar", value: "calendar" },
            ]}
          />

          <Group gap="md">
            <Group gap="xs">
              <Group gap="xs">
                <IconList size={14} color="var(--monday-text-tertiary)" />
                <Text size="xs" c="var(--monday-text-secondary)">
                  {statistics.total}
                </Text>
              </Group>
              <Text size="sm" c="var(--monday-text-secondary)">
                Total Tasks
              </Text>
            </Group>

            <Group gap="xs">
              <IconClock
                size={14}
                color={statistics.dueSoon > 0 ? "orange" : "var(--monday-text-tertiary)"}
              />
              <Text
                size="xs"
                c={statistics.dueSoon > 0 ? "orange" : "var(--monday-text-secondary)"}
              >
                {statistics.dueSoon} due soon
              </Text>
            </Group>

            {canEditTasks && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setAddTaskModalOpened(true)}
                size="sm"
              >
                New Task
              </Button>
            )}

            <Button
              leftSection={<IconUsersGroup size={16} />}
              onClick={() => setShowTeamModal(true)}
              size="sm"
            >
              Team
            </Button>
          </Group>
        </Group>

        <Box>
          <Group gap="sm">
            <TextInput
              placeholder="Search tasks..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              style={{ flex: 0.8 }}
            />
            <Select
              placeholder="Creator"
              leftSection={<IconFilter size={16} />}
              data={creators.map((creator) => ({
                value: creator.id,
                label: creator.name,
              }))}
              value={selectedCreator}
              onChange={setSelectedCreator}
              clearable
              style={{ flex: 0.6 }}
            />
            <Select
              placeholder="Priority"
              leftSection={<IconFilter size={16} />}
              data={priorities.map((priority) => ({
                value: priority as string,
                label: priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "",
              }))}
              value={selectedPriority}
              onChange={setSelectedPriority}
              clearable
            />
            <Select
              placeholder="Assignee"
              leftSection={<IconFilter size={16} />}
              data={assignees.map((assignee) => ({
                value: assignee.user.id,
                label: assignee.user.name,
              }))}
              value={selectedAssignee}
              onChange={setSelectedAssignee}
              clearable
            />
            {hasActiveFilters && (
              <Button
                variant="light"
                color="gray"
                leftSection={<IconX size={16} />}
                onClick={clearFilters}
                style={{ flexShrink: 0 }}
              >
                Clear
              </Button>
            )}
          </Group>
        </Box>

        {hasActiveFilters && (
          <Group gap="xs" mt="sm">
            {searchTerm && (
              <Badge variant="light" color="blue" size="sm">
                Search: {searchTerm}
              </Badge>
            )}
            {selectedPriority && (
              <Badge variant="light" color="orange" size="sm">
                Priority: {selectedPriority}
              </Badge>
            )}
            {selectedAssignee && (
              <Badge variant="light" color="green" size="sm">
                Assignee: {assignees.find((a) => a.userId === selectedAssignee)?.user?.name}
              </Badge>
            )}
            {selectedCreator && (
              <Badge variant="light" color="violet" size="sm">
                Creator: {creators.find((c) => c.id === selectedCreator)?.name}
              </Badge>
            )}
          </Group>
        )}
      </Paper>

      {view === "board" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Kanban
            columns={filteredColumns}
            onViewTask={handleTaskClick}
            onAddTask={handleAddTaskToColumn}
            onAddColumn={handleAddColumn}
            onDeleteColumn={handleDeleteColumn}
            onRenameColumn={handleRenameColumn}
            isAddingColumn={isAddingColumn}
            setIsAddingColumn={setIsAddingColumn}
            newColumnTitle={newColumnTitle}
            setNewColumnTitle={setNewColumnTitle}
            canEditTasks={canEditTasks}
            canDragTasks={canDragTasks}
          />
        </DragDropContext>
      ) : view === "table" ? (
        <KanbanTableView
          tasks={filteredColumns.flatMap((col) => col.cards)}
          onViewTask={handleTaskClick}
          onTaskStatusChange={handleTaskStatusChange}
          statuses={statuses}
        />
      ) : view === "calendar" ? (
        <KanbanCalendar
          tasks={filteredColumns.flatMap((col) => col.cards)}
          onViewTask={handleTaskClick}
          onTaskDeadlineChange={(id, deadline) => updateTask({ id, data: { deadline } })}
          onOpenAddTask={(deadline) => {
            setInitialDeadline(deadline);
            setAddTaskModalOpened(true);
          }}
        />
      ) : (
        <Summary />
      )}

      <AddTaskModal
        opened={addTaskModalOpened}
        onClose={() => setAddTaskModalOpened(false)}
        onAddTask={handleAddTask}
        initialDeadline={initialDeadline}
      />
      <TaskDetailModal
        opened={taskDetailModalOpened}
        onClose={() => setTaskDetailModalOpened(false)}
        taskId={selectedTask?.id as string}
      />

      <Drawer
        opened={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        title="Project Team Members"
        position="right"
        size="xl"
        radius="md"
        shadow="xl"
      >
        <ProjectMember teamMembers={teamMembers} tasks={allTasks} />
      </Drawer>
    </Box>
  );
}