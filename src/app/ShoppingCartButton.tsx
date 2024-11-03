"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from "@/hooks/cart";
import { UpdateCartItemQuantityValues } from "@/wix-api/cart";
import { currentCart } from "@wix/ecom";
import { media } from "@wix/sdk";
import { Loader2, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ShoppingCartButtonProps {
  initialData: currentCart.Cart | null;
}
function ShoppingCartButton({ initialData }: ShoppingCartButtonProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const cartQuery = useCart(initialData);

  const totalQuantity =
    cartQuery.data?.lineItems?.reduce(
      (acc, item) => acc + (item.quantity || 0),
      0,
    ) || 0;

  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveCartItem();

  return (
    <>
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)}>
          <ShoppingCartIcon />
          <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {totalQuantity < 10 ? totalQuantity : "+9"}
          </span>
        </Button>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          aria-describedby={undefined}
          className="flex flex-col sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>
              Your cart
              <span className="text-base">
                {" "}
                ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex grow flex-col space-y-5 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-5">
              {cartQuery.data?.lineItems?.map((item) => (
                <ShoppingCartItem
                  onChangeQuantity={updateQuantityMutation.mutate}
                  onRemoveItem={removeItemMutation.mutate}
                  onClickProduct={() => setSheetOpen(false)}
                  item={item}
                  key={item._id}
                />
              ))}
            </ul>
            {cartQuery.isPending && (
              <Loader2 className="mx-auto animate-spin" />
            )}
            {cartQuery.error && (
              <p className="text-destructive">{cartQuery.error.message}</p>
            )}
            {!cartQuery.isPending && !cartQuery.data?.lineItems?.length && (
              <div className="flex grow items-center justify-center text-center">
                <div className="space-y-1.5">
                  <p className="text-lg font-semibold">Your cart is empty</p>
                  <Link
                    href="/shop"
                    className="text-primary hover:underline"
                    onClick={() => setSheetOpen(false)}
                  >
                    Start shopping now
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-5">
            <div className="space-y-0.5">
              <p className="text-sm">Subtotal amount</p>
              <p className="font-bold">
                {cartQuery.data?.subtotal?.formattedConvertedAmount}
              </p>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
            </div>
            <Button
              disabled={
                !totalQuantity ||
                updateQuantityMutation.isPending ||
                removeItemMutation.isPending ||
                cartQuery.isFetching
              }
              size="lg"
            >
              Checkout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface ShoppingCartItemsProps {
  item: currentCart.LineItem;
  onChangeQuantity: (value: UpdateCartItemQuantityValues) => void;
  onRemoveItem: (itemId: string) => void;
  onClickProduct: () => void;
}
function ShoppingCartItem({
  item,
  onChangeQuantity,
  onRemoveItem,
  onClickProduct,
}: ShoppingCartItemsProps) {
  const productId = item._id;

  if (!productId) return null;

  const slug = item.url?.split("/").pop();

  const quantityLimitReached =
    !!item.quantity &&
    !!item.availability?.quantityAvailable &&
    item.quantity >= item.availability.quantityAvailable;

  const imageUrl = media.getScaledToFillImageUrl(
    item.image || "",
    112,
    112,
    {},
  );

  return (
    <li className="flex items-center gap-3">
      <Link href={`/products/${slug}`} onClick={onClickProduct}>
        <Image
          src={imageUrl}
          alt={item.productName?.translated || "Product Image"}
          width={112}
          height={112}
          className="size-28 flex-none bg-secondary"
        />
      </Link>
      <div className="space-y-1.5 text-sm">
        <Link href={`/products/${slug}`}>
          <p className="font-bold">{item.productName?.translated || "Item"}</p>
        </Link>
        {!!item.descriptionLines?.length && (
          <p>
            {item.descriptionLines
              .map(
                (line) =>
                  line.colorInfo?.translated || line.plainText?.translated,
              )
              .join(", ")}
          </p>
        )}
        <div className="flex items-center gap-2">
          {item.quantity} x {item.price?.formattedConvertedAmount}
          {item.fullPrice && item.fullPrice.amount !== item.price?.amount && (
            <span className="text-muted-foreground line-through">
              {item.fullPrice.formattedConvertedAmount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="inline-block w-fit border border-input">
            <Button
              variant="outline"
              size="sm"
              className="border-none px-2"
              onClick={() => {
                if (!item.quantity || item.quantity <= 1)
                  onRemoveItem(item._id!);
                else
                  onChangeQuantity({
                    productId,
                    newQuantity: !item.quantity ? 0 : item.quantity - 1,
                  });
              }}
            >
              -
            </Button>
            <span className="px-2">{item.quantity}</span>
            <Button
              className="border-none px-2"
              onClick={() =>
                onChangeQuantity({
                  productId,
                  newQuantity: !item.quantity ? 1 : item.quantity + 1,
                })
              }
              variant="outline"
              size="sm"
              disabled={quantityLimitReached}
            >
              +
            </Button>
          </div>
          {quantityLimitReached && <span>Quantity limit reached</span>}
        </div>
      </div>
    </li>
  );
}

export { ShoppingCartButton };
