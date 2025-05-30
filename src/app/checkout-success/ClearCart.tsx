"use client";

import { useClearCart } from "@/hooks/cart";
import { useEffect } from "react";

export function ClearCart() {
  const { mutate } = useClearCart();

  useEffect(mutate, [mutate]);

  return null;
}
