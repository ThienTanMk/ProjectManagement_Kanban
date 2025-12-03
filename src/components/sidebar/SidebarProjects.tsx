import {
  Box,
  Group,
  Stack,
  Text,
  Button,
  ScrollArea,
  Loader,
  UnstyledButton,
} from "@mantine/core";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  IconFolderPlus,
  IconStarFilled,
  IconFolder,
} from "@tabler/icons-react";
import { Project } from "../../types/api";
import { FolderSection } from "./FolderSection";
import { ProjectItem } from "./ProjectItem";

interface Folder {
  id: string;
  name: string;
  projectIds: string[];
}

interface SidebarProjectsProps {
  isLoading: boolean;
  error: any;
  filteredProjects: Project[];
  favoriteProjects: Project[];
  unassignedProjects: Project[];
  customFolders: Folder[];
  showAllProjects: boolean;
  favoriteProjectIds: Set<string>;
  expandedFolders: { [key: string]: boolean };
  currentProjectId: string | null;
  refetch: () => void;
  toggleFavorite: (projectId: string) => void;
  addProjectToFolder: (projectId: string, folderId: string) => void;
  handleDragEnd: (result: any) => void;
  handleSelectProject: (project: Project) => void;
  handleDeleteProject: (project: Project) => void;
  toggleFolder: (key: string) => void;
  setCreateFolderModalOpened: (value: boolean) => void;
  collapsed: boolean;
}

export const SidebarProjects: React.FC<SidebarProjectsProps> = ({
  isLoading,
  error,
  filteredProjects,
  favoriteProjects,
  unassignedProjects,
  customFolders,
  showAllProjects,
  favoriteProjectIds,
  expandedFolders,
  currentProjectId,
  refetch,
  toggleFavorite,
  addProjectToFolder,
  handleDragEnd,
  handleSelectProject,
  handleDeleteProject,
  toggleFolder,
  setCreateFolderModalOpened,
  collapsed,
}) => {
  const getProjectsInFolder = (folderId: string) => {
    const folder = customFolders.find((f) => f.id === folderId);
    if (!folder) return [];
    return filteredProjects.filter((p) => folder.projectIds.includes(p.id));
  };

  if (isLoading) {
    return (
      <ScrollArea flex={1} p="md">
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea flex={1} px="md" py="md" pt="xs">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack gap="sm">
          {!collapsed && (
            <Box>
              <Group justify="space-between" align="center" mb={4}>
                <Text
                  size="sm"
                  fw={600}
                  c="#7E7E8F"
                  style={{ letterSpacing: "0.5px" }}
                >
                  Projects
                </Text>
              </Group>

              {!showAllProjects && (
                <UnstyledButton
                  onClick={() => setCreateFolderModalOpened(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    color: "#D0D4E4",
                    backgroundColor: "transparent",
                    fontWeight: 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <IconFolderPlus size={14} />
                  <Text size="sm" flex={1}>
                    New folder
                  </Text>
                </UnstyledButton>
              )}
            </Box>
          )}
          {isLoading && (
            <Group justify="center" py="xl">
              <Loader size="sm" />
              {!collapsed && (
                <Text size="sm" c="#7E7E8F">
                  Loading...
                </Text>
              )}
            </Group>
          )}

          {error && !collapsed && (
            <Box p="sm" style={{ textAlign: "center" }}>
              <Text size="sm" c="red" mb="sm">
                {error?.message || "Failed to load"}
              </Text>
              <Button size="xs" variant="light" onClick={() => refetch()}>
                Retry
              </Button>
            </Box>
          )}

          {!isLoading && !error && (
            <>
              {showAllProjects ? (
                <Droppable droppableId="folder-all">
                  {(provided) => (
                    <Stack
                      gap={2}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {filteredProjects.map((project, index) =>
                        project && project.id ? (
                          <ProjectItem
                            key={project.id}
                            project={project}
                            index={index}
                            isDraggable={false}
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
                      )}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              ) : (
                <>
                  {favoriteProjects.length > 0 && (
                    <FolderSection
                      folderId="favorites"
                      folderName="Favorites"
                      projects={favoriteProjects}
                      icon={<IconStarFilled size={14} color="#FFD43B" />}
                      toggleFolder={toggleFolder}
                      expandedFolders={expandedFolders}
                      customFolders={customFolders}
                      collapsed={collapsed}
                      currentProjectId={currentProjectId}
                      toggleFavorite={toggleFavorite}
                      addProjectToFolder={addProjectToFolder}
                      handleSelectProject={handleSelectProject}
                      handleDeleteProject={handleDeleteProject}
                      favoriteProjectIds={favoriteProjectIds}
                    />
                  )}

                  {customFolders.map((folder) => (
                    <FolderSection
                      key={folder.id}
                      folderId={folder.id}
                      folderName={folder.name}
                      projects={getProjectsInFolder(folder.id)}
                      icon={<IconFolder size={14} color="#9699A6" />}
                      toggleFolder={toggleFolder}
                      expandedFolders={expandedFolders}
                      customFolders={customFolders}
                      collapsed={collapsed}
                      currentProjectId={currentProjectId}
                      toggleFavorite={toggleFavorite}
                      addProjectToFolder={addProjectToFolder}
                      handleSelectProject={handleSelectProject}
                      handleDeleteProject={handleDeleteProject}
                      favoriteProjectIds={favoriteProjectIds}
                    />
                  ))}

                  {unassignedProjects.length > 0 && (
                    <FolderSection
                      folderId="unassigned"
                      folderName="Unassigned"
                      projects={unassignedProjects}
                      toggleFolder={toggleFolder}
                      expandedFolders={expandedFolders}
                      customFolders={customFolders}
                      collapsed={collapsed}
                      currentProjectId={currentProjectId}
                      toggleFavorite={toggleFavorite}
                      addProjectToFolder={addProjectToFolder}
                      handleSelectProject={handleSelectProject}
                      handleDeleteProject={handleDeleteProject}
                      favoriteProjectIds={favoriteProjectIds}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Stack>
      </DragDropContext>
    </ScrollArea>
  );
};
