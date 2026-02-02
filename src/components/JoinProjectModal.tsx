"use client";
import { useState } from "react";
import { Modal, TextInput, Button, Stack, Text, Alert } from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useVerifyInvite } from "@/hooks/invite";
import { useProjectStore } from "@/stores/projectStore";

interface JoinProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function JoinProjectModal({
  opened,
  onClose,
}: JoinProjectModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const { mutateAsync: verifyInvite, isPending } = useVerifyInvite();
  const { setCurrentProjectId } = useProjectStore();

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;

    try {
      const result = await verifyInvite(inviteCode.trim());
      notifications.show({
        title: "Success!",
        message: "You have joined the project successfully",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      setCurrentProjectId(result.projectId);
      setInviteCode("");
      onClose();
    } catch (error: any) {
      notifications.show({
        title: "Failed to join project",
        message:
          error?.response?.data?.message ||
          "Invalid or expired invitation code",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} fz="xl" c="white">
          Join Project
        </Text>
      }
      size="md"
      radius="md"
      shadow="xl"
      className="border border-gray-300"
    >
      <Stack gap="lg">
        <Alert color="blue" icon={<IconAlertCircle />}>
          Enter the invitation code you received via email to join the project.
        </Alert>

        <TextInput
          label={<Text fw={600}>Invitation Code</Text>}
          placeholder="Enter your invitation code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleJoin();
            }
          }}
          styles={{
            input: {
              fontFamily: "monospace",
              fontSize: "16px",
              letterSpacing: "1px",
            },
          }}
          size="md"
        />

        <Button
          fullWidth
          onClick={handleJoin}
          disabled={!inviteCode.trim()}
          loading={isPending}
          size="md"
        >
          Join Project
        </Button>
      </Stack>
    </Modal>
  );
}
