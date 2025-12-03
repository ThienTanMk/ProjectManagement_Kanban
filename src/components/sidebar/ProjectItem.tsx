import {
  UnstyledButton,
  Group,
  Avatar,
  Text,
  ActionIcon,
  Menu,
  Tooltip,
} from "@mantine/core";
import {
  IconStar,
  IconStarFilled,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconFolder,
} from "@tabler/icons-react";
import { Draggable } from "@hello-pangea/dnd";
import { Project } from "../../types/api";

interface ProjectItemProps {
  project: Project;
  index: number;
  isDraggable?: boolean;
  collapsed: boolean;
  currentProjectId: string | null;
  toggleFavorite: (projectId: string) => void;
  addProjectToFolder: (projectId: string, folderId: string) => void;
  handleSelectProject: (project: Project) => void;
  handleDeleteProject: (project: Project) => void;
  customFolders: { id: string; name: string }[];
  favoriteProjectIds: Set<string>;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  index,
  isDraggable = true,
  collapsed,
  currentProjectId,
  toggleFavorite,
  addProjectToFolder,
  handleSelectProject,
  handleDeleteProject,
  customFolders,
  favoriteProjectIds,
}) => {
  const isSelected = currentProjectId === project.id;
  const projectInitial = project.name?.charAt(0)?.toUpperCase() || "?";
  const isFavorite = favoriteProjectIds.has(project.id);

  console.log(`Rendering ProjectItem: ${project.id}, collapsed: ${collapsed}, isFavorite: ${isFavorite}`); // Debug

  if (collapsed) {
    return (
      <Tooltip label={project.name || "Unknown"} position="right" withArrow>
        <UnstyledButton
          p="xs"
          style={{
            borderRadius: "6px",
            backgroundColor: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            transition: "background-color 0.15s ease",
          }}
          onClick={() => handleSelectProject(project)}
        >
          <Avatar
            size="sm"
            color={isSelected ? "blue" : "gray"}
            variant="light"
            radius="sm"
          >
            {projectInitial}
          </Avatar>
        </UnstyledButton>
      </Tooltip>
    );
  }

  const content = (
    <UnstyledButton
      p="xs"
      style={{
        borderRadius: "6px",
        backgroundColor: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
        width: "100%",
        transition: "background-color 0.15s ease",
      }}
      onClick={() => handleSelectProject(project)}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
          <Avatar
            size="sm"
            color="gray"
            variant="light"
            radius="sm"
            style={{
              color: isSelected ? "#FFFFFF" : "#9699A6",
              fontWeight: isSelected ? 600 : 400,
            }}
          >
            {projectInitial}
          </Avatar>
          <Text
            size="sm"
            truncate
            style={{
              color: isSelected ? "#FFFFFF" : "#D0D4E4",
              fontWeight: isSelected ? 600 : 400,
            }}
          >
            {project.name || "Unknown"}
          </Text>
        </Group>

        <Group gap={4} wrap="nowrap">
          <ActionIcon
            component="div"
            size="sm"
            variant="subtle"
            color={isFavorite ? "yellow" : "gray"}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(project.id);
            }}
          >
            {isFavorite ? <IconStarFilled size={14} /> : <IconStar size={14} />}
          </ActionIcon>

          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                component="div"
                size="sm"
                variant="subtle"
                color="gray"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  // onEditProject(project); // Cần prop onEditProject
                }}
              >
                Edit
              </Menu.Item>

              <Menu.Label>Add to folder</Menu.Label>
              {customFolders.length > 0 ? (
                customFolders.map((folder) => (
                  <Menu.Item
                    key={folder.id}
                    leftSection={<IconFolder size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Adding project to folder:", folder.id); // Debug
                      addProjectToFolder(project.id, folder.id);
                    }}
                  >
                    {folder.name}
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item disabled>No folders available</Menu.Item>
              )}

              <Menu.Divider />

              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </UnstyledButton>
  );

  if (!isDraggable) return content;

  return (
    <Draggable draggableId={`project-${project.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {content}
        </div>
      )}
    </Draggable>
  );
};