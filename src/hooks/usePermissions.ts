import { ProjectRole } from "@/types/api";
import { useGetRoleOnProject } from "./project";

export const usePermissions = () => {
  const { data: userRole } = useGetRoleOnProject();

  const permissions = {
    canShareProject:
      userRole === ProjectRole.ADMIN || userRole === ProjectRole.OWNER,
    canEditTasks: userRole !== ProjectRole.VIEWER,
    canDragTasks: userRole !== ProjectRole.VIEWER,
    canCreateProject: true,
    canEditProject:
      userRole === ProjectRole.ADMIN || userRole === ProjectRole.OWNER,
    canDeleteProject: userRole === ProjectRole.OWNER,
    canManageMembers:
      userRole === ProjectRole.ADMIN || userRole === ProjectRole.OWNER,
    userRole,
  };

  return permissions;
};
