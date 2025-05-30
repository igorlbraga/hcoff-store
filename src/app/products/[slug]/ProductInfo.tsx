"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Badge from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkInStock, findVariant } from "@/lib/utils";
import { products } from "@wix/stores";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ProductMedia from "./ProductMedia";
import ProductOptions from "./ProductOptions";
import ProductPrice from "./ProductPrice";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BackInStockNotificationButton } from "@/components/BackInStockNotificationButton";
import BuyNowButton from "@/components/BuyNowButton";

interface ProductDetailsProps {
  product: products.Product;
}

export default function ProductInfo({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const defaultOptionValues = product.productOptions?.reduce(
      (old, option) => ({
        ...old,
        [option.name || ""]: option.choices?.[0].description,
      }),
      {},
    );

    setSelectedOptions(defaultOptionValues as Record<string, string>);
  }, [product.productOptions]);

  const selectedVariant = findVariant(product, selectedOptions);

  const inStock = checkInStock(product, selectedOptions);

  const availableQuantity =
    selectedVariant?.stock?.quantity ?? product.stock?.quantity;

  const availableQuantityExceeded =
    !!availableQuantity && quantity > availableQuantity;

  let selectedOptionsMedia = product.productOptions?.flatMap((option) => {
    const selectedChoice = option.choices?.find(
      (choice) => choice.description === selectedOptions[option.name || ""],
    );
    return selectedChoice?.media?.items || [];
  });

  useEffect(() => {}, [selectedOptionsMedia]);

  const otherMedias =
    product.media?.items?.filter(
      (mediaItem) =>
        !selectedOptionsMedia?.find(
          (optionMedia) => optionMedia._id === mediaItem._id,
        ),
    ) || [];

  selectedOptionsMedia = selectedOptionsMedia?.concat(otherMedias);

  return (
    <div className="flex flex-col gap-10 md:flex-row lg:gap-20">
      <ProductMedia mediaList={selectedOptionsMedia} />
      <div className="basis-3/5 space-y-5">
        <div className="space-y-2.5">
          <h1 className="text-3xl font-bold lg:text-4xl">{product.name}</h1>
          {product.brand && (
            <div className="text-muted-foreground">{product.brand}</div>
          )}
          {product.ribbon && <Badge className="block">{product.ribbon}</Badge>}
        </div>
        {product.description && (
          <div
            dangerouslySetInnerHTML={{ __html: product.description }}
            className="prose dark:prose-invert"
          />
        )}
        <ProductPrice product={product} selectedVariant={selectedVariant} />
        <ProductOptions
          product={product}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex items-center gap-2.5">
            <Input
              name="quantity"
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24"
              disabled={!inStock}
            />
            {!!availableQuantity &&
              (availableQuantityExceeded || availableQuantity < 10) && (
                <span className="text-destructive">
                  Only {availableQuantity} left in stock
                </span>
              )}
          </div>
        </div>
        {inStock ? (
          <div className="flex items-center gap-2.5">
            <AddToCartButton
              product={product}
              selectedOptions={selectedOptions}
              disabled={availableQuantityExceeded || quantity < 1}
              quantity={quantity}
              className="w-full"
            />
            <BuyNowButton
              product={product}
              selectedOptions={selectedOptions}
              quantity={quantity}
              disabled={availableQuantityExceeded || quantity < 1}
            />
          </div>
        ) : (
          <BackInStockNotificationButton
            product={product}
            selectedOptions={selectedOptions}
            className="w-full"
          />
        )}

        {!!product.additionalInfoSections?.length && (
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <InfoIcon className="size-5" />
              <span>Additional product information</span>
            </span>
            <Accordion type="multiple">
              {product.additionalInfoSections.map((section) => (
                <AccordionItem value={section.title || ""} key={section.title}>
                  <AccordionTrigger>{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: section.description || "",
                      }}
                      className="prose text-sm text-muted-foreground dark:prose-invert"
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
