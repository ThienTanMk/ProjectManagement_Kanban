"use client";
import { useState } from "react";
import { Group, Button, ScrollArea, Stack } from "@mantine/core";
import { CommentsSection } from "./TaskComments";
import { HistorySection } from "./TaskHistory";
import { useGetEventByTaskId } from "@/hooks/event";
import { useGetCommentByTaskId } from "@/hooks/comment";

interface TaskTabsProps {
  taskId: string;
}

export function TaskTabs({ taskId }: TaskTabsProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "history">("comments");

  const { data: events } = useGetEventByTaskId(taskId);
  const { data: comments } = useGetCommentByTaskId(taskId);

  return (
    <>
      <Group gap="sm">
        <Button
          variant={activeTab === "comments" ? "filled" : "subtle"}
          size="sm"
          onClick={() => setActiveTab("comments")}
        >
          Comments ({comments?.length || 0})
        </Button>
        <Button
          variant={activeTab === "history" ? "filled" : "subtle"}
          size="sm"
          onClick={() => setActiveTab("history")}
        >
          History ({events?.length || 0})
        </Button>
      </Group>

      <ScrollArea.Autosize mah={300}>
        {activeTab === "comments" && <CommentsSection taskId={taskId} />}
        {activeTab === "history" && <HistorySection taskId={taskId} />}
      </ScrollArea.Autosize>
    </>
  );
}