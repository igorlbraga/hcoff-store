import { cn } from "@/lib/utils";
import { orders } from "@wix/ecom";
import { formatDate } from "date-fns";
import Link from "next/link";
import Badge from "./ui/badge";
import WixImage from "./WixImage";
import Image from "next/image";

const paymentStatusMap: Record<orders.PaymentStatus, string> = {
  [orders.PaymentStatus.PAID]: "Paid",
  [orders.PaymentStatus.NOT_PAID]: "Not paid",
  [orders.PaymentStatus.FULLY_REFUNDED]: "Refunded",
  [orders.PaymentStatus.PARTIALLY_PAID]: "Partially paid",
  [orders.PaymentStatus.PARTIALLY_REFUNDED]: "Partially refunded",
  [orders.PaymentStatus.PENDING]: "Pending",
  [orders.PaymentStatus.UNSPECIFIED]: "No information",
};

const fulfillmentStatusMap: Record<orders.FulfillmentStatus, string> = {
  [orders.FulfillmentStatus.FULFILLED]: "Delivered",
  [orders.FulfillmentStatus.NOT_FULFILLED]: "Not sent",
  [orders.FulfillmentStatus.PARTIALLY_FULFILLED]: "Partially delivered",
};

interface OrderProps {
  order: orders.Order;
}

export function Order({ order }: OrderProps) {
  return (
    <div className="w-full space-y-5 border p-5">
      <div className="flex flex-wrap items-center gap-3">
        {order.paymentStatus}
      </div>
    </div>
  );
}

interface OrderItemProps {
  item: orders.OrderLineItem;
}

function OrderItem({ item }: OrderItemProps) {
  return (
    <div className="flex flex-wrap gap-3 py-5 last:pb-0">
      <Image
        src={item.image || "/placeholder.png"}
        width={112}
        height={112}
        alt={item.productName?.translated || "Product image"}
        className="size-28 flex-none bg-secondary"
      />
      <div className="space-y-0.5">
        <p className="line-clamp-1 font-bold">{item.productName?.translated}</p>
        <p>
          {item.quantity} x {item.price?.formattedAmount}
        </p>
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
      </div>
    </div>
  );
}
