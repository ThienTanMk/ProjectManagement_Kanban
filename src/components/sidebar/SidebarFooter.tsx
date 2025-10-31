import {
  Box,
  Group,
  Text,
  Avatar,
  Button,
  Tooltip,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

interface SidebarFooterProps {
  filteredProjects: any[];
  collapsed: boolean;
  me?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onLogout: () => void;
  onNavigateToProfile: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  filteredProjects,
  collapsed,
  me,
  onLogout,
  onNavigateToProfile,
}) => {
  return (
    <>
      {!collapsed && (
        <Box
          p="sm"
          style={{
            borderTop: "1px solid #393D5A",
            backgroundColor: "#141416",
          }}
        >
          {/* --- Total Projects --- */}
          <Group justify="space-between" gap="xs" mb="xs">
            <Text size="xs" c="dimmed">
              Total Projects
            </Text>
            <Text size="xs" fw={600}>
              {filteredProjects.length}
            </Text>
          </Group>

          {/* --- Profile + Logout Section --- */}
          <Group justify="space-between" align="center" mb="xs" gap="xs">
            <Box
              onClick={onNavigateToProfile}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <Avatar size={28} src={me?.avatar} radius="xl" color="blue">
                {me?.name?.charAt(0)}
              </Avatar>
              <Box style={{ overflow: "hidden" }}>
                <Text size="sm" fw={600} truncate>
                  {me?.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {me?.email}
                </Text>
              </Box>
            </Box>

            <Tooltip label="Logout" position="top" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={onLogout}
              >
                <IconLogout size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Box>
      )}
    </>
  );
};
