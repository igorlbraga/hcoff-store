import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { backInStockNotifications } from "@wix/ecom";
import {
  BackInStockNotificationsProps,
  createBackInStockNotificationsRequest,
} from "@/wix-api/back-in-stock-notifications";
import { wixBrowserClient } from "@/lib/wix-client-browser";

export function useCreateBackInStockNotificationRequest() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: BackInStockNotificationsProps) =>
      createBackInStockNotificationsRequest(wixBrowserClient(), values),
    onError(error) {
      console.error(error);
      if (
        (error as any).details.applicationError.code ===
        "BACK_IN_STOCK_NOTIFICATION_REQUEST_ALREADY_EXISTS"
      ) {
        toast({
          variant: "destructive",
          description: "You're already subscribed to this product",
        });
      } else {
        toast({
          variant: "destructive",
          description: "Something went wrong. Please, try again",
        });
      }
    },
  });
}
