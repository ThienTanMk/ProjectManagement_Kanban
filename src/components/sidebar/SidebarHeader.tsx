import { Box, Group, Text, ActionIcon, Stack } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <Box p="md" pb="sm">
      <Group justify="space-between" wrap="nowrap">
        {!collapsed && (
          <Text size="lg" fw={600} c="#FFFFFF">
            Workspaces
          </Text>
        )}

        <Group gap={4} wrap="nowrap">
          {onToggleCollapse && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              onClick={onToggleCollapse}
            >
              {collapsed ? (
                <IconChevronRight size={16} />
              ) : (
                <IconChevronLeft size={16} />
              )}
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Box>
  );
};
