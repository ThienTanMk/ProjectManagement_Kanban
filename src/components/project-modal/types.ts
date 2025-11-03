import { UseFormReturnType } from "@mantine/form";

export interface ProjectFormValues {
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
}

export type ProjectForm = UseFormReturnType<ProjectFormValues>;