"use client";

import { products } from "@wix/stores";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../label";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { LoadingButton } from "@/components/LoadingButton";
import { useCreateProductReview } from "@/hooks/reviews";
import { useRouter } from "next/navigation";
import { StarRatingInput } from "./StarRatingInput";
import { useEffect, useRef } from "react";
import { Button } from "../button";
import {
  CircleAlert,
  ImageUp,
  Loader2,
  Play,
  PlusCircle,
  PlusCircleIcon,
  PlusSquare,
  Video,
  X,
} from "lucide-react";
import { MediaAttachment, useMediaUpload } from "./useMediaUpload";
import { url } from "inspector";
import { cn } from "@/lib/utils";

const TITLE_CHARACTHERS_LIMIT = 100;
const BODY_CHARACTHERS_LIMIT = 3000;

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Must be at least 2 characters")
    .max(TITLE_CHARACTHERS_LIMIT, "Can't be longer than 100 characters")
    .or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(10, "Must be at least 10 characters")
    .max(BODY_CHARACTHERS_LIMIT, "Can't be longer than 3000 characters")
    .or(z.literal("")),
  rating: z.number().int().min(1, "Please rate this product"),
});

type FormValues = z.infer<typeof formSchema>;

interface ReviewProductDialogProps {
  product: products.Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPosted: () => void;
}
function ProductReviewDialog({
  product,
  open,
  onOpenChange,
  onPosted,
}: ReviewProductDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      rating: 0,
    },
  });

  const mutation = useCreateProductReview();

  const { attachments, startUpload, removeAttachment, clearAttachment } =
    useMediaUpload();

  const router = useRouter();

  async function onSubmit({ title, body, rating }: FormValues) {
    if (!product._id) throw Error("Product ID is missing");

    mutation.mutate(
      {
        productId: product._id,
        title,
        body,
        rating,
        media: attachments
          .filter((m) => m.url)
          .map((m) => ({
            url: m.url!,
            type: m.file.type.startsWith("image") ? "image" : "video",
          })),
      },
      {
        onSuccess: onPosted,
      },
    );
  }

  const uploadInProgress = attachments.some((m) => m.state === "uploading");

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          form.reset();
          clearAttachment();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Did you like this product? Share your thoughts with other customers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="flex items-center gap-3">
              <Image
                src={product.media?.mainMedia?.image?.url || "/placeholder.png"}
                alt={product.media?.mainMedia?.image?.altText || ""}
                className="size-12 object-cover"
                width={48}
                height={48}
              />
              <span className="font-bold">{product.name}</span>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <StarRatingInput
                        rating={field.value}
                        setRating={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Title</FormLabel>
                      <span className="text-sm">
                        {field.value.length}/{TITLE_CHARACTHERS_LIMIT}
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        maxLength={TITLE_CHARACTHERS_LIMIT}
                        placeholder="Title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Message</FormLabel>
                      <span className="text-sm">
                        {field.value.length}/{BODY_CHARACTHERS_LIMIT}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        maxLength={BODY_CHARACTHERS_LIMIT}
                        className="resize-none"
                        placeholder="Tell others about your experience..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a detailed review to help other customers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    onRemoveClick={removeAttachment}
                  />
                ))}
                <AddMediaButton
                  onFileSelected={startUpload}
                  disabled={
                    attachments.filter((a) => a.state !== "failed").length >= 5
                  }
                />
              </div>
              <LoadingButton
                disabled={uploadInProgress}
                type="submit"
                loading={mutation.isPending}
              >
                Submit
              </LoadingButton>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AddMediaButtonProps {
  onFileSelected: (file: File) => void;
  disabled: boolean;
}

function AddMediaButton({ onFileSelected, disabled }: AddMediaButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (disabled) return null;

  return (
    <>
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        variant="ghost"
        size="icon"
        className="size-14"
        title="Add media"
        type="button"
      >
        <PlusSquare size={28} />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);

          if (files.length) {
            onFileSelected(files[0]);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewProps {
  attachment: MediaAttachment;
  onRemoveClick: (id: string) => void;
}

function AttachmentPreview({
  attachment: { id, file, state, url },
  onRemoveClick,
}: AttachmentPreviewProps) {
  return (
    <div
      className={cn(
        "group relative size-fit bg-black",
        state === "failed" && "outline outline-1 outline-destructive",
      )}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={url || URL.createObjectURL(file)}
          alt="Attachment preview"
          width={56}
          height={56}
          className={cn(
            "size-14 object-cover group-hover:opacity-50",
            !url && "opacity-50",
          )}
        />
      ) : (
        <>
          <video
            className={cn(
              "size-14 object-cover opacity-80 group-hover:opacity-50",
              !url && "opacity-50",
            )}
          >
            <source src={url || URL.createObjectURL(file)} type={file.type} />
          </video>
          <Play
            size={14}
            color="whitesmoke"
            className="absolute bottom-0.5 left-0.5"
          />
        </>
      )}
      {state === "uploading" && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <Loader2 className="animate-spin" />
        </div>
      )}
      {state === "failed" && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
          title="Failed to upload media"
        >
          <CircleAlert className="text-destructive" />
        </div>
      )}
      {state !== "uploading" && (
        <div
          onClick={() => onRemoveClick(id)}
          role="button"
          className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X size={24} color="whitesmoke" />
        </div>
      )}
    </div>
  );
}

export { ProductReviewDialog };
