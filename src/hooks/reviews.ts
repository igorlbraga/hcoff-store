import {
  createProductReview,
  CreateProductReviewValues,
} from "@/wix-api/reviews";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { getWixClient } from "@/lib/wix.browser";

export function useCreateProductReview() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: CreateProductReviewValues) =>
      createProductReview(getWixClient(), values),
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to create review. Please try again.",
      });
    },
  });
}
