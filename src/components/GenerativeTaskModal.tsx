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
} from "@mantine/core";
import dayjs from "dayjs";
import { DateTimePicker } from "@mantine/dates";
import { CreateTaskDto, Priority } from "@/types/api";

interface GenerativeTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onPrefer: () => void;
  initialTitle: string;
  initialDescription: string;
  initialPriority: Priority;
  initialAssignees: string[];
  initialDeadline: Date | null;
}

export default function GenerativeTaskModal({
  opened,
  onClose,
  onPrefer,
  initialTitle,
  initialDescription,
  initialPriority,
  initialAssignees,
  initialDeadline,
}: GenerativeTaskModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [assignees, setAssignees] = useState<string[]>(initialAssignees);
  const [deadline, setDeadline] = useState<Date | null>(initialDeadline);

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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={700}>
          Generative Task
        </Text>
      }
      size="xl"
      withOverlay={false}
      withinPortal={false}
      // styles={{
      //   content: {  
      //     border: "2px solid #e2e8f0", 
      //     borderRadius: "12px", 
      //     boxShadow: "0 4px 20px rgba(0,0,0,0.15)", 
      //     top: "10%",
      //     right: "10%",
      //     transform: "none",
      //   },
      // }}
       classNames={{
        content: `border-2 border-gray-300 rounded-2xl shadow-xl
                  absolute top-[10%] right-[10%] translate-x-0 translate-y-0`,
      }}
    >
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
        <div className="flex justify-end">
          <Button size="lg" onClick={onPrefer}>
            Prefer
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
