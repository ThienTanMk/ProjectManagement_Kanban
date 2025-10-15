"use client";
import { useState, useMemo, useEffect } from "react";
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
  Modal,
  Drawer,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { DropResult } from "@hello-pangea/dnd";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconX,
  IconAlertCircle,
  IconUsersGroup,
} from "@tabler/icons-react";
import AddTaskModal from "./AddTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import KanbanTableView from "./KanbanTableView";
import KanbanCalendar from "./KanbanCalendar";
import ProjectMember from "./ProjectMember";
import Summary from "./Summary"
import Kanban from "./Kanban";
import { useProjectStore } from "../stores/projectStore";
import {
  useCreateTask,
  useCurrentProjectTasks,
  useTasksByProject,
  useUpdateTaskStatus,
  useUpdateTask,
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
import { useGetTeamMembers, useGetRoleOnProject } from "@/hooks/project";
interface Column {
  id: string;
  title: string;
  cards: Task[];
}
export default function KanbanBoard() {
  const { currentProjectId } = useProjectStore();
  const { canEditTasks, canDragTasks } = usePermissions();

  const { data: statuses = [], refetch: refetchStatues } = useGetStatuses();
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
  const [view, setView] = useState<"summary" | "board" | "table" | "calendar">(
    "board"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  // const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [addTaskModalOpened, setAddTaskModalOpened] = useState(false);
  const [taskDetailModalOpened, setTaskDetailModalOpened] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [addTaskToColumnId, setAddTaskToColumnId] = useState<string | null>(
    null
  );
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();

  const [showTeamModal, setShowTeamModal] = useState(false); // State cho modal hiển thị danh sách thành viên
  const { data: teamMembers = [], isLoading: isLoadingTeam } =
    useGetTeamMembers(); // Lấy danh sách thành viên
  const { data: roleOnProject } = useGetRoleOnProject(); // Lấy vai trò

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

  // const columns: Column[] = useMemo(() => {
  //   return (
  //     statuses?.map((status) => ({
  //       id: status.id,
  //       title: status.name,
  //       cards: tasks?.filter((task) => task.statusId === status.id) || [],
  //     })) || []
  //   );
  // }, [statuses, tasks]);
  const filteredColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      cards: column.cards.filter((task) => {
        const matchesSearch = task.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesPriority =
          !selectedPriority || task.priority === selectedPriority;
        const matchesAssignee =
          !selectedAssignee ||
          task.assignees?.map((a) => a.user.id).includes(selectedAssignee);
        const matchesCreator =
          !selectedCreator || task.ownerId === selectedCreator;
        return matchesSearch && matchesPriority && matchesAssignee;
      }),
    }));
  }, [
    columns,
    searchTerm,
    selectedPriority,
    selectedAssignee,
    selectedCreator,
  ]);
  const allTasks = columns.flatMap((col) => col.cards);
  const priorities = unionBy(
    allTasks.flatMap((task) => task.priority),
    (o) => o
  );
  const assignees = unionBy(
    allTasks.flatMap((task) => task.assignees || []),
    (o) => o.userId
  );
  const creators = unionBy(
    allTasks.flatMap((task) => (task.owner ? [task.owner] : [])),
    (o) => o.id
  );
  const handleDragEnd = (result: DropResult) => {
    // Không cho phép drag & drop nếu là VIEWER
    if (!canDragTasks) return;

    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // try {
    //   await updateTaskStatus({
    //     id: draggableId,
    //     statusId: destination.droppableId,
    //   });
    // } catch (error) {
    //   console.error("Error handling drag end:", error);
    // }
    if (view === "board" || view === "table") {
      try {
        updateTaskStatus({
          id: draggableId,
          statusId: destination.droppableId,
        });
      } catch (error) {
        console.error("Error handling drag end:", error);
      }
    }
    // Xử lý drag-drop cho calendar (cập nhật deadline)
    else if (view === "calendar") {
      const newDateKey = destination.droppableId.replace("calendar-day-", "");
      try {
        updateTask({ id: draggableId, data: { deadline: newDateKey } });
      } catch (error) {
        console.error("Error updating task deadline:", error);
      }
    }
  };
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
  const handleAddTaskToColumn = (columnId: string) => {
    setAddTaskToColumnId(columnId);
    setAddTaskModalOpened(true);
  };
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpened(true);
  };
  const handleEditTask = (updatedTask: Task) => {
    console.log("Edit task:", updatedTask);
  };
  const handleDeleteTask = (taskId: string) => {
    modals.openConfirmModal({
      title: "Delete Task",
      children: (
        <Text size="sm">
          Are you sure you want to delete this task? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        console.log("Delete task:", taskId);
      },
    });
  };
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      await addStatus(newColumnTitle);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    } catch (error) {
      console.error("Failed to add column:", error);
    }
  };
  const handleDeleteColumn = async (columnId: string) => {
    const column = statuses?.find((s) => s.id === columnId);
    const tasksInColumn =
      tasks?.filter((task) => task.statusId === columnId) || [];

    if (tasksInColumn.length > 0) {
      // Show warning if column has tasks
      modals.openConfirmModal({
        title: "Cannot Delete Column",
        children: (
          <Text size="sm">
            This column contains {tasksInColumn.length} task(s). Please move or
            delete all tasks before deleting the column.
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
          Are you sure you want to delete "{column?.name}" This action cannot be
          undone.
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
      await updateTaskStatus({
        id: taskId,
        statusId: newStatus,
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriority(null);
    setSelectedAssignee(null);
    setSelectedCreator(null);
    // setSelectedTag(null);
  };
  const hasActiveFilters =
    searchTerm || selectedPriority || selectedAssignee || selectedCreator;
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
    <div className="h-full">
      <div className="mb-6 space-y-4">
        <Group justify="space-between">
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
          {/* {canEditTasks && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setAddTaskModalOpened(true)}
            >
              Add Task
            </Button>
          )} */}
          <Group>
            {canEditTasks && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setAddTaskModalOpened(true)}
              >
                Add Task
              </Button>
            )}
            <Button
              leftSection={<IconUsersGroup size={16} />}
              onClick={() => setShowTeamModal(true)}
              variant="outline"
            >
              Show Team
            </Button>
          </Group>
        </Group>

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
              label: priority
                ? priority.charAt(0).toUpperCase() + priority.slice(1)
                : "",
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

        {hasActiveFilters && (
          <Group gap="xs">
            {searchTerm && (
              <Badge variant="light" color="blue">
                Search: {searchTerm}
              </Badge>
            )}
            {selectedPriority && (
              <Badge variant="light" color="orange">
                Priority: {selectedPriority}
              </Badge>
            )}
            {selectedAssignee && (
              <Badge variant="light" color="green">
                Assignee:{" "}
                {
                  assignees.find((a) => a.userId === selectedAssignee)?.user
                    ?.name
                }
              </Badge>
            )}
            {selectedCreator && (
              <Badge variant="light" color="violet">
                Creator: {creators.find((c) => c.id === selectedCreator)?.name}
              </Badge>
            )}
          </Group>
        )}
      </div>
      {view === "board" ? (
        <Kanban
          columns={filteredColumns}
          onDragEnd={handleDragEnd}
          onTaskClick={handleTaskClick}
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
      ) : view === "table" ? (
        <KanbanTableView
          tasks={filteredColumns.flatMap((col) => col.cards)}
          onViewTask={handleTaskClick}
          onTaskStatusChange={handleTaskStatusChange}
          statuses={statuses}
        />
      ) : view === "calendar" ?(
        <KanbanCalendar
          tasks={filteredColumns.flatMap((col) => col.cards)}
          onViewTask={handleTaskClick}
          onTaskDeadlineChange={(id, deadline) =>
            updateTask({ id, data: { deadline } })
          }
        />
      ) : (
        <Summary/>  
      )}

      <AddTaskModal
        opened={addTaskModalOpened}
        onClose={() => setAddTaskModalOpened(false)}
        onAddTask={handleAddTask}
      />
      <TaskDetailModal
        opened={taskDetailModalOpened}
        onClose={() => setTaskDetailModalOpened(false)}
        taskId={selectedTask?.id as string}
      />

      {/* Modal hiển thị danh sách thành viên */}
      <Drawer
        opened={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        title="Project Team Members"
        position="right"
        size="xl"
        radius="md"
        shadow="xl"
        // withBorder
        classNames={{
          body: "h-screen overflow-y-auto", 
          content: "flex flex-col",
        }}
      >
        <ProjectMember teamMembers={teamMembers} tasks={allTasks} />
      </Drawer>
    </div>
  );
}
