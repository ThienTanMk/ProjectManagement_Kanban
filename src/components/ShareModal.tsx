"use client";
import { useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Select,
  Stack,
  Group,
  Text,
  Paper,
  Avatar,
  Badge,
  ActionIcon,
  Loader,
  Alert,
  Title,
  Flex,
} from "@mantine/core";
import {
  IconTrash,
  IconSend,
  IconCopy,
  IconAlertCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useGetInvites, useAddInvite, useDeleteInvite } from "@/hooks/invite";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectRole, InviteStatus } from "@/types/api";

interface ShareModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function ShareModal({ opened, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);
  const [isInviting, setIsInviting] = useState(false);
  const [hasInviteSent, setHasInviteSent] = useState(false);

  const { currentProjectId } = useProjectStore();
  const { data: invites, isLoading: invitesLoading } = useGetInvites();
  const { mutateAsync: addInvite } = useAddInvite();

  const { mutateAsync: deleteInvite } = useDeleteInvite();
  const [inviteId, setInviteId] = useState<string | null>(null);

  const inviteLink = currentProjectId
    ? `${window.location.origin}/login?joinId=${inviteId}`
    : "";

  const handleSendInvite = async () => {
    if (!email.trim()) return;

    setIsInviting(true);
    try {
      const res = await addInvite({ email: email.trim(), role });
      setInviteId(res.id);
      setHasInviteSent(true);
      notifications.show({
        title: "Invite sent!",
        message: `Invitation sent to ${email} as ${role}`,
        color: "green",
      });
      setEmail("");
    } catch (error) {
      notifications.show({
        title: "Failed to send invite",
        message: "Please try again",
        color: "red",
      });
      console.error("Failed to send invite:", error);
    } finally {
      setIsInviting(false);
    }
  };
  const handleRemoveInvite = async (inviteId: string) => {
    try {
      await deleteInvite(inviteId);
      notifications.show({
        title: "Invite removed",
        message: "Invitation has been cancelled",
        color: "blue",
      });
    } catch (error) {
      notifications.show({
        title: "Failed to remove invite",
        message: "Please try again",
        color: "red",
      });
      console.error("Failed to remove invite:", error);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    notifications.show({
      title: "Link copied!",
      message: "Invite link copied to clipboard",
      color: "blue",
    });
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      notifications.show({
        title: "Feature coming soon",
        message: "Remove member functionality will be available soon",
        color: "blue",
      });
    } catch (error) {
      notifications.show({
        title: "Failed to remove member",
        message: "Please try again",
        color: "red",
      });
      console.error("Failed to remove member:", error);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  return (
    <Modal opened={opened} onClose={onClose}  title={<Text fw={700} fz="xl" c="white">Share Project</Text>}
      size="900px"
      radius="md"
      shadow="xl"
      className="border border-gray-300" 
      mb="md"
      >
      <Stack gap="lg">
        <div>
          <Text size="lg" fw={700} mb="mb" mt="md">
            Invite by email
          </Text>
          <Stack gap="lg">
            <TextInput
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendInvite();
                }
              }}
            />
            <Group gap="lg" align="end">
              <Select
                label={<Title order={4}>Role</Title>} 
                value={role}
                onChange={(value) =>
                  setRole((value as ProjectRole) || ProjectRole.MEMBER)
                }
                data={[
                  { value: ProjectRole.ADMIN, label: "Admin" },
                  { value: ProjectRole.MEMBER, label: "Member" },
                  { value: ProjectRole.VIEWER, label: "Viewer" },
                ]}
                style={{ flex: 1 }}
              />
              <Button
                leftSection={<IconSend size={20} />}
                onClick={handleSendInvite}
                disabled={!email.trim() || !isValidEmail(email.trim())}
                loading={isInviting}
                variant="filled"
                color="blue"
              >
                Send
              </Button>
            </Group>
          </Stack>
        </div>

        {hasInviteSent && (
          <div>
            <Text size="lg" fw={500} mb="mb">
              Share link
            </Text>
            <Group gap="lg">
              <TextInput value={inviteLink} readOnly style={{ flex: 1 }} />
              <Button
                variant="outline"
                leftSection={<IconCopy size={16} />}
                onClick={copyInviteLink}
              >
                Copy
              </Button>
            </Group>
          </div>
        )}

        {/* <div>
          <Text size="sm" fw={500} mb="xs">
            Team Members ({teamMembers?.length || 0})
          </Text>
          <Stack gap="xs">
            {teamMembers && teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <Paper key={member.userId} p="sm" withBorder>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Avatar src={member.user.avatar} size="sm" radius="xl">
                        {member.user.name
                          ? member.user.name[0].toUpperCase()
                          : member.user.email[0].toUpperCase()}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {member.user.name || member.user.email}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {member.user.email}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge
                        variant="light"
                        size="sm"
                        color={
                          member.role === ProjectRole.OWNER
                            ? "grape"
                            : member.role === ProjectRole.ADMIN
                            ? "red"
                            : member.role === ProjectRole.MEMBER
                            ? "blue"
                            : "gray"
                        }
                      >
                        {member.role}
                      </Badge>
                      {member.role !== ProjectRole.OWNER && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Paper>
              ))
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="lg">
                No team members yet
              </Text>
            )}
          </Stack>
        </div> */}

        <div>
          <Text size="lg" fw={700} mb="mb">
            Invited Members ({invites?.length || 0})
          </Text>
          <Stack gap="lg">
            {invites && invites.length > 0 ? (
              invites.map((invite) => (
                <Paper key={invite.id} p="lg" withBorder>
                  <Group justify="space-between">
                    <Group gap="md">
                      <Avatar size="md" radius="xl">
                        {invite.email[0].toUpperCase()}
                      </Avatar>
                      <div>
                        <Text size="md" fw={500}>
                          {invite.email}
                        </Text>
                        <Group gap="xs" mt={2}>
                          <Text size="md" c="dimmed">
                            Invited •{" "}
                            {dayjs(invite.createdAt).format("MMM DD, YYYY")}
                          </Text>
                          <Badge
                            variant="outline"
                            size="md"
                            color={
                              invite.role === ProjectRole.ADMIN
                                ? "red"
                                : invite.role === ProjectRole.MEMBER
                                ? "blue"
                                : "gray"
                            }
                          >
                            {invite.role}
                          </Badge>
                        </Group>
                      </div>
                    </Group>
                    <Group gap="lg">
                      <Badge
                        variant="light"
                        size="lg"
                        color={
                          invite.status === InviteStatus.PENDING
                            ? "yellow"
                            : invite.status === InviteStatus.ACCEPTED
                            ? "green"
                            : "red"
                        }
                      >
                        {invite.status}
                      </Badge>
                      {invite.status === InviteStatus.PENDING && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="xl"
                          onClick={() => handleRemoveInvite(invite.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Paper>
              ))
            ) : (
              <Text size="lg" c="dimmed" ta="center" py="lg">
                No pending invitations
              </Text>
            )}
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
