import { wixBrowserClient } from "@/lib/wix-client-browser";
import {
  addToCart,
  AddToCartValues,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  UpdateCartItemQuantityValues,
} from "@/wix-api/cart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import { toast, useToast } from "./use-toast";
import { products } from "@wix/stores";

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
    queryFn: async () => getCart(wixBrowserClient()),
    initialData,
  });
}

export function useAddItemToCart() {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: AddToCartValues) =>
      addToCart(wixBrowserClient(), values),
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
      updateCartItemQuantity(wixBrowserClient(), variables),
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
      removeCartItem(wixBrowserClient(), productId),
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
