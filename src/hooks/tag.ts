import { queryClient } from "@/services/queryClient";
import { addTag, getTags } from "@/services/tagApi";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useGetTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });
}

export function useAddTag() {
  return useMutation({
    mutationFn: addTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
