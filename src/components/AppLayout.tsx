import { useState } from "react";
import {
  Divider,
  Flex,
  Box,
} from "@mantine/core";

import ProjectSidebar from "./ProjectSidebar";
import ProjectModal from "./ProjectModal";
import { Project } from "../types/api";
import { useGetMe } from "@/hooks/user";
interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  onNavigateToProfile: () => void;
}

export default function AppLayout({
  children,
  onLogout,
  onNavigateToProfile,
}: AppLayoutProps) {
  const { data: me } = useGetMe();
  const [projectModalOpened, setProjectModalOpened] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpened(true);
  };
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpened(true);
  };
  const handleCloseModal = () => {
    setProjectModalOpened(false);
    setEditingProject(null);
  };
  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  return (
    <Flex className="fixed inset-0 flex overflow-hidden">
      <Box
        style={{
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 20,
          backgroundColor: "#141416",
          width: sidebarCollapsed ? "80px" : "288px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ProjectSidebar
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          me={me}
          onLogout={onLogout}
          onNavigateToProfile={onNavigateToProfile}
        />
      </Box>

      <Flex
        direction="column"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "288px",
          height: "100vh",
          flex: 1,
          overflow: "hidden", // giữ layout gọn
        }}
      >
        {/* Header */}
       {/* <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: "65px",
            borderBottom: "1px solid var(--monday-border-primary)",
            backgroundColor: "var(--monday-bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
          }}
        > */}
          {/* Left: Logo + title */}
          {/* <Group gap="sm">
            <IconLayoutKanban size={32} color="#228be6" stroke={2.5} />
            <Text
              size="28px"
              fw={700}
              c="blue"
              className="tracking-tight select-none"
            >
              TaskBoard
            </Text>
          </Group>

          <Group>
            <NotificationDropdown />
            <Tooltip label="Logout" position="top" withArrow>
              <ActionIcon
                variant="light"
                // color="red"
                size="sm"
                onClick={onLogout}
              >
                <IconLogout size={20} />
              </ActionIcon>
            </Tooltip>
            <Button
              variant="subtle"
              color="gray"
              p={4}
              radius="xl"
              style={{ height: "auto" }}
            >
              <Group gap="sm" onClick={onNavigateToProfile}>
                <Avatar size="md" src={me?.avatar} radius="xl" color="blue">
                  {me?.name?.charAt(0)}
                </Avatar>
                <div style={{ textAlign: "left" }}>
                  <Text size="sm" fw={600}>
                    {me?.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {me?.email}
                  </Text>
                </div>
              </Group>
            </Button>
          </Group>
        </Box>  */}
        <Divider />

        {/* Main content */}
        <Box
          style={{
            flex: 1,
            backgroundColor: "var(--monday-bg-bg)",
            // backgroundColor: "#141416" ,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          {children}
        </Box>
      </Flex>

      {/* Project Modal */}
      <ProjectModal
        opened={projectModalOpened}
        onClose={handleCloseModal}
        project={editingProject}
      />
    </Flex>
  );
}
