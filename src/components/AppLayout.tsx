import { useState } from "react";
import { Divider, Flex, Box, ActionIcon, Drawer } from "@mantine/core";

import ProjectSidebar from "./ProjectSidebar";
import ProjectModal from "./ProjectModal";
import { Project } from "../types/api";
import { useGetMe } from "@/hooks/user";
import { useMediaQuery } from "@mantine/hooks";
import { IconMenu2 } from "@tabler/icons-react";
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
  const [mobileSidebarOpened, setMobileSidebarOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpened(true);
    if (isMobile) setMobileSidebarOpened(false);
  };
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpened(true);
    if (isMobile) setMobileSidebarOpened(false);
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
      {!isMobile && (
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
      )}

       {isMobile && (
        <>
          <Box
            style={{
              position: "fixed",
              top: 12,
              left: 12,
              zIndex: 50,
            }}
          >
            <ActionIcon
              size="lg"
              variant="filled"
              color="gray"
              onClick={() => setMobileSidebarOpened(true)}
            >
              <IconMenu2 size={18} />
            </ActionIcon>
          </Box>

          <Drawer
            opened={mobileSidebarOpened}
            onClose={() => setMobileSidebarOpened(false)}
            padding="md"
            size="80%"
            position="left"
            zIndex={60}
            overlayProps={{ opacity: 0.55 }}
          >
            <ProjectSidebar
              onCreateProject={handleCreateProject}
              onEditProject={handleEditProject}
              collapsed={false}
              onToggleCollapse={handleToggleCollapse}
              me={me}
              onLogout={() => {
                setMobileSidebarOpened(false);
                onLogout();
              }}
              onNavigateToProfile={() => {
                setMobileSidebarOpened(false);
                onNavigateToProfile();
              }}
            />
          </Drawer>
        </>
      )}

      <Flex
        direction="column"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "288px",
          height: "100vh",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            flex: 1,
            backgroundColor: "var(--monday-bg-bg)",
            overflowY: "auto",
            padding: "20px",
          }}
        >
          {children}
        </Box>
      </Flex>

      <ProjectModal
        opened={projectModalOpened}
        onClose={handleCloseModal}
        project={editingProject}
      />
    </Flex>
  );
}
