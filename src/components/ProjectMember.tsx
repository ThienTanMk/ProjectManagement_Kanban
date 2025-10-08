"use client";
import {
  Paper,
  Group,
  Text,
  Badge,
  Stack,
  Accordion,
  Avatar,
} from "@mantine/core";
import { UsersOnProject, Task } from "@/types/api";

interface ProjectMemberProps {
  teamMembers: UsersOnProject[];
  tasks: Task[];
}

export default function ProjectMember({
  teamMembers,
  tasks,
}: ProjectMemberProps) {
  return (
    <Stack gap="md">
      {teamMembers.length > 0 ? (
        teamMembers.map((member) => {
          // Lọc các task mà thành viên này đảm nhận (dựa trên assignees)
          const memberTasks = tasks.filter((task) =>
            task.assignees?.some((assignee) => assignee.userId === member.userId)
          );

          return (
            <Paper key={member.userId} p="md" shadow="sm" withBorder>
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <Avatar src={member.user.avatar} size="md" radius="xl">
                    {member.user.name?.[0] || member.user.email?.[0]}
                  </Avatar>
                  <Stack gap={0}>
                    <Text fw={500}>{member.user.name || "Unknown"}</Text>
                    <Text size="sm" c="dimmed">
                      {member.user.email}
                    </Text>
                  </Stack>
                </Group>
                <Group gap="xs">
                  <Badge color="blue" variant="light">
                    {member.role}
                  </Badge>
                  <Badge color="green" variant="light">
                    BE {/* vai trò cố định ạm thời */}
                  </Badge>
                </Group>
              </Group>

              {/*task của thành viên */}
              <Accordion variant="contained">
                <Accordion.Item value="tasks">
                  <Accordion.Control>
                    Tasks Assigned ({memberTasks.length})
                  </Accordion.Control>
                  <Accordion.Panel>
                    {memberTasks.length > 0 ? (
                      <Stack gap="xs">
                        {memberTasks.map((task) => (
                          <Text key={task.id} size="sm">
                            - {task.name} (Status: {task.status?.name || "Unknown"})
                          </Text>
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
  );
}