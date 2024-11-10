import {
  addToCart,
  AddToCartValues,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  UpdateCartItemQuantityValues,
} from "@/wix-api/cart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import { toast, useToast } from "./use-toast";
import { products } from "@wix/stores";
import { getWixClient } from "@/lib/wix";

const queryKey = ["cart"];

type Cart = currentCart.Cart & {
  subtotal?: {
    amount: string;
    convertedAmount: string;
    formattedAmount: string;
    formattedConvertedAmount: string;
  };
};

export function useCart(initialData: Cart | null) {
  return useQuery({
    queryKey,
    queryFn: async () => getCart(getWixClient("browser")),
    initialData,
  });
}

export function useAddItemToCart() {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: AddToCartValues) =>
      addToCart(getWixClient("browser"), values),
    onSuccess: (data) => {
      toast({ description: "Item added to cart" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to add item to cart. Please, try again later",
      });
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateCartItemQuantityValues) =>
      updateCartItemQuantity(getWixClient("browser"), variables),
    async onMutate(variables) {
      await queryClient.cancelQueries({ queryKey });
      const previousQuery = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData: Cart) => ({
        ...oldData,
        subtotal: { formattedConvertedAmount: "Calculating..." },
        lineItems: oldData?.lineItems?.map((lineItem) =>
          lineItem._id === variables.productId
            ? { ...lineItem, quantity: variables.newQuantity }
            : lineItem,
        ),
      }));
      return { previousQuery };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousQuery);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong",
      });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      removeCartItem(getWixClient("browser"), productId),
    async onMutate(productId) {
      await queryClient.cancelQueries({ queryKey });
      const previousQuery = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData: Cart) => ({
        ...oldData,
        subtotal: { formattedConvertedAmount: "Calculating..." },
        lineItems: oldData?.lineItems?.filter(
          (lineItem) => lineItem._id !== productId,
        ),
      }));
      return { previousQuery };
    },
    onError(error, productId, context) {
      queryClient.setQueryData(queryKey, context?.previousQuery);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong",
      });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCart(getWixClient("browser")),
    onSuccess() {
      queryClient.setQueryData(queryKey, null);
      queryClient.invalidateQueries({ queryKey });
    },
    retry: 3,
  });
}
