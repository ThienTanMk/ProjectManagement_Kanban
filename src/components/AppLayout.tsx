import { useState } from "react";
import { AppShell, Group, Button, Text, Avatar, Menu } from "@mantine/core";
import { IconUser, IconSettings, IconLogout } from "@tabler/icons-react";
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
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: sidebarCollapsed ? 80 : 300,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Text style={{fontSize: "25px"}} 
              fw={700} c="blue">
              TaskBoard
            </Text>
          </Group>
          <Group gap="sm">
            <Menu shadow="md" width={300}>
              <Menu.Target>
                <Button
                  // className="text-lg"
                  variant="subtle"
                  leftSection={
                    <Avatar size="sm" src={me?.avatar} radius="xl">
                      {me?.name?.charAt(0)}
                    </Avatar>
                  }
                >
                  <Text size="lg" fw={500}>
                    {me?.name}
                  </Text>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  <Text size="md" fw={500} lineClamp={1}>
                    {me?.email}
                  </Text>
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconUser size={20} />}
                  onClick={onNavigateToProfile}
                >
                  <Text size="lg">
                    Profile
                  </Text>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={20} />}
                  color="red"
                  onClick={onLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <ProjectSidebar
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      <ProjectModal
        opened={projectModalOpened}
        onClose={handleCloseModal}
        project={editingProject}
      />
    </AppShell>
  );
}
