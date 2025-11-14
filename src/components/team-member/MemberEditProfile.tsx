import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Select,
  Button,
  Stack,
  Group,
  Text,
  MultiSelect,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import {
  Level,
  UsersOnProject,
  UpdateMemberRoleDto,
  ProjectRole,
  UpdateMemberProfileDto,
} from "@/types/api";

interface MemberEditProfileProps {
  opened: boolean;
  onClose: () => void;
  member: UsersOnProject | null;
  onUpdateMemberRole?: (data: {
    memberId: string;
    data: UpdateMemberRoleDto;
  }) => Promise<void>;
  onUpdateMemberProfile?: (data: {
    memberId: string;
    data: UpdateMemberProfileDto;
  }) => Promise<void>;
  isUpdating?: boolean;
  isOwner?: boolean;
  currentUserId?: string;
}

const AVAILABLE_TECHNOLOGIES = [
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Express",
  "NestJS",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "Go",
  "Rust",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "TypeScript",
  "JavaScript",
];

export default function MemberEditProfile({
  opened,
  onClose,
  member,
  onUpdateMemberRole,
  onUpdateMemberProfile,
  isUpdating = false,
  isOwner = false,
  currentUserId,
}: MemberEditProfileProps) {
  const [role, setRole] = useState<ProjectRole | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened && member) {
      setRole(member.role || null);
      setLevel(member.level || null);
      setTechnologies(member.technologies || []);
      setError(null);
    }
  }, [opened, member]);

  const handleSubmit = async () => {
    if (!member || !currentUserId) return;

    try {
      setError(null);

      // User chỉ có thể update profile của chính mình
      if (member.userId === currentUserId) {
        const profileData: UpdateMemberProfileDto = {};

        // Chỉ gửi các giá trị đã thay đổi
        if (level !== member.level) {
          profileData.level = level;
        }

        if (
          JSON.stringify(technologies.sort()) !==
          JSON.stringify((member.technologies || []).sort())
        ) {
          profileData.technologies = technologies;
        }

        if (Object.keys(profileData).length > 0) {
          await onUpdateMemberProfile?.({
            memberId: member.userId,
            data: profileData,
          });
        }
      }

      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update";
      setError(errorMessage);
      console.error("Error updating profile:", err);
    }
  };

  const hasChanges = () => {
    if (!member) return false;
    return (
      (isOwner && role !== member.role) ||
      level !== (member.level || null) ||
      JSON.stringify(technologies.sort()) !==
        JSON.stringify((member.technologies || []).sort())
    );
  };
  const canEdit =
    (isOwner && member?.userId !== currentUserId) ||
    member?.userId === currentUserId;

  const showRoleSelect = isOwner && member?.userId !== currentUserId;
  const showProfileFields = member?.userId === currentUserId;

  if (!member) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" fw={700}>
          Edit Member Profile
        </Text>
      }
      size="md"
      centered
    >
      <LoadingOverlay visible={isUpdating} />

      <Stack gap="md">
        {/* Member Info */}
        <div>
          <Text size="sm" fw={500} c="dimmed" mb={4}>
            Member Information
          </Text>
          <Text size="sm" fw={600}>
            {member.user?.name || "Unknown"}
          </Text>
          <Text size="xs" c="dimmed">
            {member.user?.email || "N/A"}
          </Text>
        </div>

        {/* Role Selection - Only for owners */}
        {showRoleSelect && (
          <Select
            label="Role"
            placeholder="Select role"
            value={role}
            onChange={(value) => setRole(value as ProjectRole)}
            data={[
              { value: ProjectRole.ADMIN, label: "Admin" },
              { value: ProjectRole.MEMBER, label: "Member" },
              { value: ProjectRole.VIEWER, label: "Viewer" },
            ]}
            clearable
            size="sm"
          />
        )}

        {/* Level Selection */}
        {showProfileFields && (
          <>
            <Select
              label="Level"
              placeholder="Select level"
              value={level}
              onChange={(value) => setLevel(value as Level)}
              data={[
                { value: Level.JUNIOR, label: "Junior" },
                { value: Level.MID, label: "Mid" },
                { value: Level.SENIOR, label: "Senior" },
                { value: Level.LEAD, label: "Lead" },
              ]}
              clearable
              size="sm"
            />

            {/* Technologies Selection */}
            <MultiSelect
              label="Technologies"
              placeholder="Select technologies"
              value={technologies}
              onChange={setTechnologies}
              data={AVAILABLE_TECHNOLOGIES.map((tech) => ({
                value: tech,
                label: tech,
              }))}
              searchable
              clearable
              size="sm"
            />
          </>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges() || isUpdating}
            loading={isUpdating}
            leftSection={<IconCheck size={16} />}
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
