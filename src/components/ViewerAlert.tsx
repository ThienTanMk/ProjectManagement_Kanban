import { Alert, Text } from "@mantine/core";
import { IconEye, IconLock } from "@tabler/icons-react";
import { usePermissions } from "@/hooks/usePermissions";
import { ProjectRole } from "@/types/api";

export default function ViewerAlert() {
  const { userRole } = usePermissions();

  if (userRole !== ProjectRole.VIEWER) return null;

  return (
    <Alert
      icon={<IconEye size={16} />}
      title="Viewer Mode"
      color="blue"
      variant="light"
      mb="md"
    >
      <Text size="sm">
        You have <strong>Viewer</strong> permissions for this project. You can
        view tasks and project details, but cannot edit, create, delete, or
        rearrange items.
      </Text>
    </Alert>
  );
}
