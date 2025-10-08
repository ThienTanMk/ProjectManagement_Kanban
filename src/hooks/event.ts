import { useAuth } from "./useAuth";
import { getEventByTaskId } from "@/services/event";
import { useQuery } from "@tanstack/react-query";

export function useGetEventByTaskId(taskId: string) {
  const { uid } = useAuth();
  return useQuery({
    queryKey: ["events", uid, taskId],
    queryFn: () => getEventByTaskId(taskId),
    enabled: !!uid && !!taskId,
  });
}
