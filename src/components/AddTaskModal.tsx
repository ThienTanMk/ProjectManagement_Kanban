"use client";
import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Select,
  Stack,
  MultiSelect,
  NumberInput,
  Text,
  ActionIcon,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useGetAvailableUsers, useGetMe } from "@/hooks/user";
import { CreateTaskDto, Priority } from "@/types/api";
import { IconSparkles } from "@tabler/icons-react";
interface AddTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onAddTask: (task: CreateTaskDto) => void;
  initialDeadline?: string | null;
}

export default function AddTaskModal({
  opened,
  onClose,
  onAddTask,
  initialDeadline,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isGenerativeMode, setIsGenerativeMode] = useState(false);
  const { data: me } = useGetMe();
  const currentUser = me?.name || "";
  const { data: availableUsers } = useGetAvailableUsers();
  const authors = currentUser;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAddTask({
      name: title,
      description,
      priority,
      assignees,
      deadline: deadline ? dayjs(deadline).toISOString() : undefined,
      ownerId: me?.id || "",
      statusId: "",
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(Priority.MEDIUM);
    setAssignees([]);
    setDeadline(null);
    setIsGenerativeMode(false);
  };

  const handleGenerativeSubmit = () => {
    setIsGenerativeMode(true);
  };

  const handlePreferAddTask = () => {
    setIsGenerativeMode(false);
  };

  const handlePreferGenerative = () => {
    setIsGenerativeMode(false);
  };
  //để tạm sao thay đổi bằng api
  useEffect(() => {
    if (opened) {
      resetForm();
      if (initialDeadline) {
        setDeadline(dayjs(initialDeadline).toDate());
      }
    }
  }, [opened, initialDeadline]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <Text size="xl" fw={700}>
            Add New Task
          </Text>

          {isGenerativeMode && (
            <Text size="xl" fw={700} style={{ marginLeft: "325px" }}>
              Generative Task
            </Text>
          )}
        </div>
      }
      // size={isGenerativeMode ? "90vw" : "xl"}
      size="xl"
      centered={!isGenerativeMode}
      // centered={true}
      classNames={{
        content: `border-2 border-gray-300 rounded-xl shadow-xl  
                  ${
                    isGenerativeMode
                      ? "absolute top-[10%] max-w-[100%] flex flex-row"
                      : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  }`,
        body: isGenerativeMode ? "flex flex-row w-full h-full p-4" : "",
      }}
    >
      <Stack gap="lg" className={isGenerativeMode ? "w-1/2 pr-4" : "w-full"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Text size="lg" fw={600}>
              Task Title
            </Text>
            <Text c="red">*</Text>
          </div>

          {title.trim() && (
            <ActionIcon
              color={isGenerativeMode ? "blue" : ""}
              variant={isGenerativeMode ? "filled" : "light"}
              onClick={() => setIsGenerativeMode((prev) => !prev)}
              title={
                isGenerativeMode
                  ? "Turn off generative mode"
                  : "Switch to generative mode"
              }
              size="sm"
              radius="xl"
            >
              <IconSparkles size={16} />
            </ActionIcon>
          )}
        </div>

        <TextInput
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          size="lg"
        />

        <Textarea
          label="Description"
          placeholder="Enter task description"
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
          placeholder="Select assignees"
          value={assignees}
          onChange={setAssignees}
          data={
            availableUsers?.map((user) => ({
              value: user.id,
              label: user.name,
            })) || []
          }
          searchable
          size="lg"
        />
        <div>
          <Text size="lg" fw={500} mb="xs">
            Authors
          </Text>
          <Text size="sm" c="dimmed">
            {authors}
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            Authors are automatically set to the current user and cannot be
            changed.
          </Text>
        </div>
        <DateTimePicker
          label="Deadline"
          placeholder="Select deadline"
          value={deadline}
          onChange={(value) =>
            setDeadline(value ? dayjs(value).toDate() : null)
          }
          clearable
          size="lg"
        />
        <div className="flex gap-3 justify-end">
          {!isGenerativeMode ? (
            <>
              <Button variant="outline" size="lg" onClick={onClose}>
                Cancel
              </Button>
              <Button size="lg" onClick={handleSubmit} disabled={!title.trim()}>
                Add Task
              </Button>
            </>
          ) : (
            <div className="flex justify-end">
              <Button size="lg" onClick={handlePreferAddTask}>
                Prefer Add
              </Button>
              <div className="flex-1" />
            </div>
          )}
        </div>
      </Stack>
      {isGenerativeMode && (
        <Stack gap="lg" className="w-1/2 pl-4">
          {/* <TextInput
            label="Generated Task Title"
            placeholder="Generated task title"
            value={title} //thay bằng giá trị từ agent
            onChange={(e) => setTitle(e.target.value)}
            required
            size="lg"
            labelProps={{ style: { fontSize: "1.1rem", fontWeight: 600 } }}
          /> */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Text size="lg" fw={600}>
              Generated task Title
            </Text>
            <Text c="red">*</Text>
          </div>

        </div>

        <TextInput
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          size="lg"
          labelProps={{ style: { fontSize: "1.1rem", fontWeight: 600 } }}
        />
          <Textarea
            label="Generated Description"
            placeholder="Generated task description"
            value={description} //thay bằng giá trị từ agent
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
            size="lg"
            labelProps={{ style: { fontSize: "1.1rem", fontWeight: 600 } }}
          />
          <Select
            label="Generated Priority"
            value={priority} // thay bằng giá trị từ agent
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
            label="Generated Assignees"
            placeholder="Generated assignees"
            value={assignees} // thay bằng giá trị từ agent
            onChange={setAssignees}
            data={[]} // API
            searchable
            size="lg"
          />
          <div>
            <Text size="lg" fw={500} mb="xs">
              Authors
            </Text>
            <Text size="sm" c="dimmed">
              {authors}
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              Authors are automatically set to the current user and cannot be
              changed.
            </Text>
          </div>
          <DateTimePicker
            label="Generated Deadline"
            placeholder="Generated deadline"
            value={deadline} //thay bằng giá trị từ agent
            onChange={(value) =>
              setDeadline(value ? dayjs(value).toDate() : null)
            }
            clearable
            size="lg"
          />
          <div className="flex justify-end">
            <Button size="lg" onClick={handlePreferGenerative}>
              Prefer Generative
            </Button>
          </div>
        </Stack>
      )}
    </Modal>
  );
}
