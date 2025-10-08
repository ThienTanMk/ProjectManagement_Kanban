"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Group, Button, Text, Container, Alert } from "@mantine/core";
import { IconShare, IconAlertCircle } from "@tabler/icons-react";
import KanbanBoardNew from "../components/KanbanBoardNew";
import ShareModal from "../components/ShareModal";
import NotificationDropdown from "../components/NotificationDropdown";
import AppLayout from "../components/AppLayout";
import ViewerAlert from "../components/ViewerAlert";
import { useProjectStore } from "../stores/projectStore";
import { useProject } from "../hooks/project";
import { useUserStore } from "@/stores/userStore";
import { usePermissions } from "@/hooks/usePermissions";
export default function KanbanScreen() {
  const router = useRouter();
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const { currentProjectId } = useProjectStore();
  const {} = useProject(currentProjectId);
  const { canShareProject } = usePermissions();
  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  const {
    data: currentProject,
    isLoading,
    error,
  } = useProject(currentProjectId);
  const { clearData } = useProjectStore();
  const { clearData: clearUserData } = useUserStore();

  const handleLogout = () => {
    localStorage.clear();
    clearData();
    clearUserData();
    router.push("/login");
  };
  useEffect(() => {}, []);
  return (
    <AppLayout
      onLogout={handleLogout}
      onNavigateToProfile={handleNavigateToProfile}
    >
      <Container fluid>
        {}
        {currentProject && (
          <div className="mb-6">
            <Group justify="space-between" mb="lg">
              <div>
                <Text style={{fontSize: "28px"}} 
                  fw={700}>
                  {currentProject.name}
                </Text>
                {currentProject.description && (
                  <Text size="lg" c="dimmed">
                    {currentProject.description}
                  </Text>
                )}
              </div>
              <Group gap="lg" ml="md">
                {canShareProject && (
                  <Button
                    variant="outline"
                    leftSection={<IconShare size={20} />}
                    onClick={() => setShareModalOpened(true)}
                  >
                    <Text size="md" fw={600}>
                      Share Project
                    </Text>
                  </Button>
                )}
                <NotificationDropdown />
              </Group>
            </Group>
          </div>
        )}

        {!currentProjectId && !isLoading && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="No Project Selected"
            color="blue"
            variant="light"
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
      </Container>
    </AppLayout>
  );
}
