import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { Droppable } from "@hello-pangea/dnd";
import { IconChevronDown, IconChevronRight, IconFolder } from "@tabler/icons-react";
import { Project } from "../../types/api";
import { ProjectItem } from "./ProjectItem";

interface FolderSectionProps {
  folderId: string;
  folderName: string;
  projects: Project[];
  icon?: React.ReactNode;
  toggleFolder: (key: string) => void;
  expandedFolders: { [key: string]: boolean };
  customFolders: { id: string; name: string }[];
  collapsed: boolean;
  currentProjectId: string | null;
  toggleFavorite: (projectId: number) => void;
  addProjectToFolder: (projectId: number, folderId: string) => void;
  handleSelectProject: (project: Project) => void;
  handleDeleteProject: (project: Project) => void;
  favoriteProjectIds: Set<number>;
}

export const FolderSection: React.FC<FolderSectionProps> = ({
  folderId,
  folderName,
  projects,
  icon,
  toggleFolder,
  expandedFolders,
  customFolders,
  collapsed,
  currentProjectId,
  toggleFavorite,
  addProjectToFolder,
  handleSelectProject,
  handleDeleteProject,
  favoriteProjectIds,
}) => {
  const isExpanded = expandedFolders[folderId] ?? false;

  console.log(`Rendering FolderSection: ${folderId}, isExpanded: ${isExpanded}, projects:`, projects);

  return (
    <Box>
      <UnstyledButton
        onClick={() => toggleFolder(folderId)}
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: "6px",
          transition: "background-color 0.15s ease",
          backgroundColor: isExpanded ? "rgba(255, 255, 255, 0.04)" : "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            {icon || <IconFolder size={14} color="#9699A6" />}
            <Text size="sm" c="#D0D4E4" fw={500}>
              {folderName}
            </Text>
            <Text size="xs" c="#7E7E8F">
              {projects.length}
            </Text>
          </Group>
          {isExpanded ? (
            <IconChevronDown size={14} color="#7E7E8F" />
          ) : (
            <IconChevronRight size={14} color="#7E7E8F" />
          )}
        </Group>
      </UnstyledButton>

      {isExpanded && !collapsed && (
        <Droppable droppableId={`folder-${folderId}`}>
          {(provided) => (
            <Stack
              gap={2}
              mt={4}
              ml="sm"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {projects.length > 0 ? (
                projects.map((project, index) =>
                  project && project.id ? (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      index={index}
                      isDraggable={folderId !== "favorites"}
                      collapsed={collapsed}
                      currentProjectId={currentProjectId}
                      toggleFavorite={toggleFavorite}
                      addProjectToFolder={addProjectToFolder}
                      handleSelectProject={handleSelectProject}
                      handleDeleteProject={handleDeleteProject}
                      customFolders={customFolders}
                      favoriteProjectIds={favoriteProjectIds}
                    />
                  ) : (
                    <Text key={index} size="xs" c="red" ml="sm" py="xs">
                      Invalid project data
                    </Text>
                  )
                )
              ) : (
                <Text size="xs" c="#7E7E8F" ml="sm" py="xs">
                  No projects
                </Text>
              )}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      )}
    </Box>
  );
};