"use client";

import { useState, useEffect } from "react";
import { useProfileCompletionStore } from "@/hooks/user";
import { useGetTeamMembers, useUpdateMember } from "@/hooks/project";
import { useGetMe } from "@/hooks/user";
import { useRouter } from "next/navigation";
import MemberEditProfile from "./MemberEditProfile";
import { Modal, Text, Stack } from "@mantine/core";
import { UpdateMemberProfileDto, UsersOnProject } from "@/types/api";

export default function ProfileCompletionWrapper() {
  const router = useRouter();
  const { data: currentUser } = useGetMe();
  const {
    pendingProjectId,
    shouldShowProfileModal,
    setPendingProjectId,
    setShouldShowProfileModal,
  } = useProfileCompletionStore();

  const { data: teamMembers } = useGetTeamMembers();
  const [currentMember, setCurrentMember] = useState<UsersOnProject | null>(
    null
  );

  useEffect(() => {
    if (shouldShowProfileModal && teamMembers && currentUser) {
      const member = teamMembers.find((m) => m.userId === currentUser.id);
      setCurrentMember(member ?? null);
    }
  }, [shouldShowProfileModal, teamMembers, currentUser]);

  const handleClose = () => {
    // User cancel -> không cho vào project
    setShouldShowProfileModal(false);
    setPendingProjectId(null);
    setCurrentMember(null);
  };

  const updateProfileMutation = useUpdateMember();

  const handleProfileComplete = async ({
    memberId,
    data,
  }: {
    memberId: string;
    data: UpdateMemberProfileDto;
  }) => {
    if (!currentUser || !pendingProjectId) return;

    try {
      await updateProfileMutation.mutateAsync({
        projectId: pendingProjectId,
        memberId,
        data,
      });

      setShouldShowProfileModal(false);
      router.push(`/?projectId=${pendingProjectId}`);
      setPendingProjectId(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!shouldShowProfileModal || !currentMember) return null;

  return (
    <Modal
      opened={shouldShowProfileModal}
      onClose={handleClose}
      title={
        <Stack gap={4}>
          <Text size="lg" fw={700}>
            Complete Your Profile
          </Text>
          <Text size="sm" c="dimmed">
            Please provide your level and technologies before joining the
            project
          </Text>
        </Stack>
      }
      size="md"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <MemberEditProfile
        opened={true}
        onClose={handleClose}
        member={currentMember}
        onUpdateMember={handleProfileComplete}
        isOwner={false}
        currentUserId={currentUser?.id}
        isRequiredCompletion={true} // Flag để biết đây là bắt buộc
      />
    </Modal>
  );
}
