"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Group,
  Button,
  Text,
  Container,
  Alert,
  Paper,
  Stack,
  Modal,
} from "@mantine/core";
import {
  IconShare,
  IconAlertCircle,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import KanbanBoardNew from "../components/KanbanBoardNew";
import ShareModal from "../components/ShareModal";
import AppLayout from "../components/AppLayout";
import ViewerAlert from "../components/ViewerAlert";
import AITaskCreationModal from "../components/AITaskCreationModal";
import ProjectMember from "../components/ProjectMember";
import { useProjectStore } from "../stores/projectStore";
import {
  useProject,
  useGetTeamMembers,
  useProjectTasks,
} from "../hooks/project";
import { useUserStore } from "@/stores/userStore";
import { usePermissions } from "@/hooks/usePermissions";

export default function KanbanScreen() {
  const router = useRouter();
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [aiTaskModalOpened, setAiTaskModalOpened] = useState(false);
  const [memberModalOpened, setMemberModalOpened] = useState(false);
  const { currentProjectId } = useProjectStore();
  const { canShareProject } = usePermissions();
  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  const {
    data: currentProject,
    isLoading,
    error,
  } = useProject(currentProjectId);
  const { data: teamMembers = [] } = useGetTeamMembers();
  const { data: tasks = [] } = useProjectTasks(currentProjectId);
  const { clearData } = useProjectStore();
  const { clearData: clearUserData } = useUserStore();

  const handleLogout = () => {
    localStorage.clear();
    clearData();
    clearUserData();
    router.push("/login");
  };

  return (
    <AppLayout
      onLogout={handleLogout}
      onNavigateToProfile={handleNavigateToProfile}
    >
      <Container fluid px={0}>
        {currentProject && (
          <Paper
            p="md"
            mb="md"
            radius="md"
            style={{
              backgroundColor: "var(--monday-bg-secondary)",
              border: "1px solid var(--monday-border-primary)",
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <div>
                  <Group gap="md" align="center">
                    <div>
                      <Text size="xl" fw={700} c="var(--monday-text-primary)">
                        {currentProject.name}
                      </Text>
                      {currentProject.description && (
                        <Text size="sm" c="var(--monday-text-secondary)">
                          {currentProject.description}
                        </Text>
                      )}
                    </div>
                  </Group>
                </div>

                <Group gap="md">
                  <Button
                    variant="outline"
                    color="violet"
                    leftSection={<IconSparkles size={16} />}
                    onClick={() => setAiTaskModalOpened(true)}
                    size="sm"
                  >
                    Create with AI
                  </Button>
                  <Button
                    variant="outline"
                    color="blue"
                    leftSection={<IconUsers size={16} />}
                    onClick={() => setMemberModalOpened(true)}
                    size="sm"
                  >
                    Team Members
                  </Button>
                  {canShareProject && (
                    <Button
                      leftSection={<IconShare size={16} />}
                      onClick={() => setShareModalOpened(true)}
                      size="sm"
                    >
                      Share
                    </Button>
                  )}
                </Group>
              </Group>
            </Stack>
          </Paper>
        )}

        {!currentProjectId && !isLoading && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="No Project Selected"
            variant="light"
            mb="md"
          >
            Please select a project from the sidebar to start managing tasks, or
            create a new project if you haven't done so.
          </Alert>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error Loading Projects"
            color="red"
            variant="light"
            mb="md"
          >
            {error?.toString()}
          </Alert>
        )}

        {currentProjectId && currentProject && (
          <>
            <ViewerAlert />
            <KanbanBoardNew />
          </>
        )}

        <ShareModal
          opened={shareModalOpened}
          onClose={() => setShareModalOpened(false)}
        />

        <AITaskCreationModal
          opened={aiTaskModalOpened}
          onClose={() => setAiTaskModalOpened(false)}
        />

        <Modal
          opened={memberModalOpened}
          onClose={() => setMemberModalOpened(false)}
          title={
            <Text size="lg" fw={700}>
              Team Members
            </Text>
          }
          size="xl"
          centered
        >
          <ProjectMember teamMembers={teamMembers} tasks={tasks} />
        </Modal>
      </Container>
    </AppLayout>
  );
}
