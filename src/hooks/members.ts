import { updateMemberInfo, UpdateMemberInfoValues } from "@/wix-api/members";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "./use-toast";
import { getWixClient } from "@/lib/wix.browser";

export function useUpdateMember() {
  const { toast } = useToast();

  const router = useRouter();

  return useMutation({
    mutationFn: (variables: UpdateMemberInfoValues) =>
      updateMemberInfo(getWixClient(), variables),
    onSuccess() {
      toast({
        description: "Profile updated",
      });
      setTimeout(() => {
        router.refresh();
      }, 2000);
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });
}
