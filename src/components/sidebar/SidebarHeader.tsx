import { Box, Group, Text, ActionIcon, Stack, Avatar } from "@mantine/core";
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
          <Group gap="sm" wrap="nowrap">
            <Avatar
              src="/image/logo.jpg"
              alt="TaskMind Logo"
              size="md"
              radius="md"
            />
            <Text size="lg" fw={600} c="var(--monday-text-primary)">
              TaskMind
            </Text>
          </Group>
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
