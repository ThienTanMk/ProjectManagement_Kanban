"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Select,
  Stack,
  MultiSelect,
  Text,
  Paper,
  Box,
  Group,
  ActionIcon,
  ScrollArea,
  Badge,
} from "@mantine/core";
import dayjs from "dayjs";
import { DateTimePicker } from "@mantine/dates";
import { CreateTaskDto, Priority } from "@/types/api";
import { notifications } from "@mantine/notifications";
import { IconClock, IconSparkles, IconUser, IconX } from "@tabler/icons-react";
import { assign } from "lodash";
import { ta } from "zod/v4/locales";
import { getPriorityColor } from "@/lib/utils";

export interface GeneratedTask {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  deadline: string;
  estimatedTime: number;
  assigned?: string[];
}

interface GenerativeTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onPrefer: () => void;
  initialTitle: string;
  initialDescription: string;
  initialPriority: Priority;
  initialAssignees: string[];
  initialDeadline: Date | null;
  projectName?: string;
  compact?: boolean;
}

// Hàm generate tasks mockdata
export const generateTasksForProject = (projectName?: string): GeneratedTask[] => {
  const mockTasks: GeneratedTask[] = [
    {
      id: "gen-task-1",
      name: "Setup Project Infrastructure",
      description: "Initialize repository, setup CI/CD pipeline, configure development environment",
      priority: Priority.HIGH,
      deadline: dayjs().add(3, "day").toISOString(),
      estimatedTime: 8,
      assigned: ["Ethan", "Fiona"],
    },
    {
      id: "gen-task-2",
      name: "Design Database Schema",
      description: "Create ERD, define tables, relationships, and indexes",
      priority: Priority.HIGH,
      deadline: dayjs().add(5, "day").toISOString(),
      estimatedTime: 6,
      assigned: ["Ethan", "Fiona"],
    },
    {
      id: "gen-task-3",
      name: "Implement Authentication System",
      description: "Setup JWT authentication, user login/register, password recovery",
      priority: Priority.MEDIUM,
      deadline: dayjs().add(7, "day").toISOString(),
      estimatedTime: 10,
    },
    {
      id: "gen-task-4",
      name: "Create API Endpoints",
      description: "Develop RESTful APIs for all core features",
      priority: Priority.MEDIUM,
      deadline: dayjs().add(10, "day").toISOString(),
      estimatedTime: 12,
      assigned: ["Ethan", "Fiona"],
    },
    {
      id: "gen-task-5",
      name: "Build Frontend Components",
      description: "Develop reusable UI components and pages",
      priority: Priority.LOW,
      deadline: dayjs().add(14, "day").toISOString(),
      estimatedTime: 15,
      assigned: ["Ethan", "Fiona"],
    },
  ];

  return mockTasks;
};

export default function GenerativeTaskModal({
  opened,
  onClose,
  onPrefer,
  initialTitle,
  initialDescription,
  initialPriority,
  initialAssignees,
  initialDeadline,
  projectName,
  compact = false,
}: GenerativeTaskModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [assignees, setAssignees] = useState<string[]>(initialAssignees);
  const [deadline, setDeadline] = useState<Date | null>(initialDeadline);

   // State cho generative 
   const [showGeneratedTasks, setShowGeneratedTasks] = useState(false);
   const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
   const [selectedTask, setSelectedTask] = useState<GeneratedTask | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setPriority(initialPriority);
    setAssignees(initialAssignees);
    setDeadline(initialDeadline);
  }, [
    initialTitle,
    initialDescription,
    initialPriority,
    initialAssignees,
    initialDeadline,
  ]);

  // Hàm generate tasks
  const handleGenerateTasks = () => {
    const tasks = generateTasksForProject(projectName);
    setGeneratedTasks(tasks);
    setShowGeneratedTasks(true);
    
    notifications.show({
      title: "✨ Tasks Generated",
      message: `${tasks.length} tasks have been generated successfully!`,
      color: "blue",
    });
  };

  // Hàm select task từ generated list
  const handleSelectTask = (task: GeneratedTask) => {
    setTitle(task.name);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(dayjs(task.deadline).toDate());
    setAssignees(task.assigned || []);
    setSelectedTask(task);
    setShowGeneratedTasks(false);
    
    notifications.show({
      title: "Task Selected",
      message: "Task details have been populated",
      color: "green",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700}>
          Generative Task
        </Text>
      }
      size={showGeneratedTasks ? "xl" : "lg"}
      withOverlay={false}
      withinPortal={false}
       classNames={{
        content: `border-2 border-gray-300 rounded-2xl shadow-xl
                  absolute top-[10%] right-[10%] translate-x-0 translate-y-0`,
      }}
    >
       {showGeneratedTasks ? (
        //Danh sách tasks đã generate
        <Box>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconSparkles size={20} color="#228be6" />
              <Text fw={600}>Generated Tasks ({generatedTasks.length})</Text>
            </Group>
            <ActionIcon 
              onClick={() => setShowGeneratedTasks(false)}
              color="gray"
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>

          <ScrollArea h={500}>
            <Stack gap="sm">
              {generatedTasks.map((task) => (
                <Paper
                  key={task.id}
                  p="md"
                  withBorder
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleSelectTask(task)}
                  className="hover:bg-blue-50"
                >
                  <Text fw={600} size="sm" mb={4}>
                    {task.name}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
                    {task.description}
                  </Text>
                  <Group gap="xs">
                    <Badge
                      size="sm"
                      color={getPriorityColor(task.priority)}
                      variant="light"
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      size="sm"
                      variant="light"
                      leftSection={<IconClock size={12} />}
                    >
                      {task.estimatedTime}h
                    </Badge>
                    <Badge size="sm" variant="light" color="gray">
                      {dayjs(task.deadline).format("MMM DD")}
                    </Badge>
                  </Group>
                  {task.assigned && (
                    <Group gap="xs" mt={4}>
                      <IconUser size={compact ? 10 : 12} stroke={1.5} />
                      <Text size="xs" c="dimmed">
                        {Array.isArray(task.assigned)
                          ? task.assigned.join(", ")
                          : task.assigned}
                      </Text>
                    </Group>
                  )}
                </Paper>
              ))}
            </Stack>
          </ScrollArea>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setShowGeneratedTasks(false)}>
              Cancel
            </Button>
          </Group>
        </Box>
      ) : (
      <Stack gap="lg">
        <TextInput
          label="Task Title"
          placeholder="Generated task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          size="lg"
          labelProps={{ style: { fontSize: "1.1rem", fontWeight: 600 } }}
        />
        <Textarea
          label="Description"
          placeholder="Generated task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
          size="lg"
          labelProps={{ style: { fontSize: "1.1rem", fontWeight: 600 } }}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(value) =>
            setPriority((value as Priority) || Priority.MEDIUM)
          }
          data={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
          size="lg"
        />
        <MultiSelect
          label="Assignees"
          placeholder="Generated assignees"
          value={assignees}
          onChange={setAssignees}
          data={[]} 
          searchable
          size="lg"
        />
        <DateTimePicker
          label="Deadline"
          placeholder="Generated deadline"
          value={deadline}
          onChange={(value) =>
            setDeadline(value ? dayjs(value).toDate() : null)
          }
          clearable
          size="lg"
        />
         {selectedTask && (
            <Paper p="sm" withBorder style={{ backgroundColor: "#f0f9ff" }}>
              <Text size="xs" c="dimmed" mb={4}>
                ✨ Auto-filled from generated task
              </Text>
              <Text size="sm" fw={500}>
                Estimated time: {selectedTask.estimatedTime} hours
              </Text>
            </Paper>
          )}
        <div className="flex justify-end">
          <Button size="lg" onClick={onPrefer}>
          Create Task
          </Button>
        </div>
      </Stack>
        )}
    </Modal>
  );
}
