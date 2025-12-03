"use client";
import { useState } from "react";
import {
  Paper,
  Group,
  Text,
  Badge,
  Stack,
  Accordion,
  Avatar,
  Tooltip,
  Button,
  ActionIcon,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { UsersOnProject, Task, UpdateMemberRoleDto } from "@/types/api";
import { useGetMe } from "@/hooks/user";
import { useUpdateMember } from "@/hooks/project";
import { useProjectStore } from "@/stores/projectStore";
import MemberEditProfile from "./team-member/MemberEditProfile";
import TaskDetailModal from "./TaskDetailModal";

interface ProjectMemberProps {
  teamMembers: UsersOnProject[];
  tasks: Task[];
}

export default function ProjectMember({
  teamMembers,
  tasks,
}: ProjectMemberProps) {
  const [editingMember, setEditingMember] = useState<UsersOnProject | null>(
    null
  );
  const [editModalOpened, setEditModalOpened] = useState(false);

  const { data: currentUser } = useGetMe();
  const { currentProjectId } = useProjectStore();
  const { mutateAsync: updateMember, isPending: isUpdating } =
    useUpdateMember();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalOpened, setTaskModalOpened] = useState(false);

  const openTaskDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskModalOpened(true);
  };

  const isOwner = teamMembers.some(
    (member) => member.userId === currentUser?.id && member.role === "OWNER"
  );

  const handleEditProfile = (member: UsersOnProject) => {
    setEditingMember(member);
    setEditModalOpened(true);
  };

  const handleCloseModal = () => {
    setEditModalOpened(false);
    setEditingMember(null);
  };

  const handleUpdateMember = async ({
    memberId,
    data,
  }: {
    memberId: string;
    data: UpdateMemberRoleDto;
  }) => {
    if (!currentProjectId) return;

    await updateMember({
      projectId: currentProjectId,
      memberId,
      data,
    });
  };

  const isCurrentUserMember = (memberId: string) => {
    return currentUser?.id === memberId;
  };

  return (
    <>
      <Stack gap="md">
        {teamMembers.length > 0 ? (
          teamMembers.map((member) => {
            const memberName = member.user?.name || "Unknown";
            const memberEmail = member.user?.email || "N/A";
            const memberAvatar =
              member.user?.avatar || "https://avatar.iran.liara.run/public/5";

            // Lọc task theo assignee
            const memberTasks = tasks.filter((task) =>
              task.assignees?.some((a) => a.userId === member.userId)
            );

            const createdTasks = tasks.filter(
              (task) => task.ownerId === member.userId
            );

            const canEdit = isCurrentUserMember(member.userId);

            return (
              <Paper
                key={member.userId}
                p="md"
                shadow="sm"
                withBorder
                radius="md"
                style={{
                  backgroundColor: "var(--monday-bg-tertiary)",
                  border: "1px solid var(--monday-border-primary)",
                }}
              >
                {/* Header thông tin cơ bản */}
                <Group justify="space-between" mb="sm" align="flex-start">
                  <Group align="flex-start" gap="sm">
                    <Avatar src={memberAvatar} size="md" radius="xl">
                      {memberName[0]}
                    </Avatar>
                    <Stack gap={2}>
                      <Text
                        fw={500}
                        style={{ color: "var(--monday-text-primary)" }}
                      >
                        {memberName}
                      </Text>
                      <Text
                        size="sm"
                        style={{ color: "var(--monday-text-tertiary)" }}
                      >
                        {memberEmail}
                      </Text>

                      {/* Level + Technologies */}
                      <Group gap={6} mt={4} wrap="wrap">
                        {member.level && (
                          <Badge color="violet" size="sm" variant="light">
                            {member.level}
                          </Badge>
                        )}
                        {member.technologies &&
                          member.technologies.length > 0 &&
                          member.technologies.slice(0, 3).map((tech, idx) => (
                            <Badge
                              key={idx}
                              color="grape"
                              variant="outline"
                              size="xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        {member.technologies &&
                          member.technologies.length > 3 && (
                            <Tooltip
                              label={member.technologies.slice(3).join(", ")}
                              position="top"
                            >
                              <Badge color="gray" variant="outline" size="xs">
                                +{member.technologies.length - 3}
                              </Badge>
                            </Tooltip>
                          )}
                      </Group>
                    </Stack>
                  </Group>

                  {/* Vai trò trong project và nút edit */}
                  <Group gap={6}>
                    <Tooltip label="Project role" position="top">
                      <Badge
                        color={
                          member.role === "OWNER"
                            ? "red"
                            : member.role === "ADMIN"
                            ? "blue"
                            : member.role === "MEMBER"
                            ? "green"
                            : "gray"
                        }
                        variant="light"
                      >
                        {member.role}
                      </Badge>
                    </Tooltip>

                    {canEdit && (
                      <Tooltip label="Edit your profile" position="top">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="sm"
                          onClick={() => handleEditProfile(member)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Group>

                {/* Danh sách task created */}
                <Accordion variant="contained">
                  <Accordion.Item value={`created-${member.userId}`}>
                    <Accordion.Control>
                      <Text fw={500}>
                        Tasks Created ({createdTasks.length})
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {createdTasks.length > 0 ? (
                        <Stack gap="xs">
                          {createdTasks.map((task) => (
                            <Group
                              key={task.id}
                              justify="space-between"
                              wrap="nowrap"
                              p="xs"
                              onClick={() => openTaskDetail(task.id)}
                              className="cursor-pointer rounded border 
                                        border-(--monday-border-primary) 
                                        bg-(--monday-bg-tertiary)]
                                        hover:bg-(--monday-bg-hover)"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--monday-bg-hover)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--monday-bg-tertiary)")
                              }
                            >
                              <Text
                                size="sm"
                                className="text-sm text-(--monday-text-primary) flex-1"
                              >
                                • {task.name}
                              </Text>
                              <Badge
                                size="xs"
                                color={
                                  task.taskState?.name
                                    ?.toLowerCase()
                                    .includes("done")
                                    ? "green"
                                    : task.taskState?.name
                                        ?.toLowerCase()
                                        .includes("progress")
                                    ? "blue"
                                    : "gray"
                                }
                                variant="light"
                              >
                                {task.taskState?.name || "No status"}
                              </Badge>
                            </Group>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed">
                          No tasks created
                        </Text>
                      )}
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>

                {/* Danh sách task */}
                <Accordion variant="contained">
                  <Accordion.Item value={`tasks-${member.userId}`}>
                    <Accordion.Control>
                      <Text fw={500}>
                        Tasks Assigned ({memberTasks.length})
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {memberTasks.length > 0 ? (
                        <Stack gap="xs">
                          {memberTasks.map((task) => (
                            <Group
                              key={task.id}
                              justify="space-between"
                              wrap="nowrap"
                              p="xs"
                              onClick={() => openTaskDetail(task.id)}
                              style={{
                                backgroundColor: "var(--monday-bg-tertiary)",
                                borderRadius: "4px",
                                border:
                                  "1px solid var(--monday-border-primary)",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--monday-bg-hover)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--monday-bg-tertiary)")
                              }
                            >
                              <Text
                                size="sm"
                                style={{
                                  color: "var(--monday-text-primary)",
                                  flex: 1,
                                }}
                              >
                                • {task.name}
                              </Text>
                              <Badge
                                size="xs"
                                color={
                                  task.taskState?.name
                                    ?.toLowerCase()
                                    .includes("done")
                                    ? "green"
                                    : task.taskState?.name
                                        ?.toLowerCase()
                                        .includes("progress")
                                    ? "blue"
                                    : "gray"
                                }
                                variant="light"
                              >
                                {task.taskState?.name || "No status"}
                              </Badge>
                            </Group>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed">
                          No tasks assigned
                        </Text>
                      )}
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Paper>
            );
          })
        ) : (
          <Text c="dimmed">No team members found.</Text>
        )}
      </Stack>

      {/* Edit Profile Modal */}
      <MemberEditProfile
        opened={editModalOpened}
        onClose={handleCloseModal}
        member={editingMember}
        onUpdateMember={handleUpdateMember}
        isUpdating={isUpdating}
        isOwner={isOwner}
        currentUserId={currentUser?.id}
      />
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          opened={taskModalOpened}
          onClose={() => {
            setTaskModalOpened(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </>
  );
}
