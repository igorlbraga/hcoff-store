"use client";

import logo from "@/assets/logo.png";
import { LoadingButton } from "@/components/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getWixClient } from "@/lib/wix.browser";
import { getProductReviews } from "@/wix-api/reviews";
import { useInfiniteQuery } from "@tanstack/react-query";
import { reviews } from "@wix/reviews";
import { media as wixMedia } from "@wix/sdk";
import { products } from "@wix/stores";
import { CornerDownRight, Play, PlayCircle, StarIcon } from "lucide-react";
import Image from "next/image";
import { ElementRef, useEffect, useRef, useState } from "react";
import Zoom from "react-medium-image-zoom";

interface ProductReviewsProps {
  product: products.Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["product-reviews", product._id],
      queryFn: async ({ pageParam }) => {
        if (!product._id) throw Error("Product ID missing");

        const pageSize = 2;

        return getProductReviews(getWixClient(), {
          productId: product._id,
          limit: pageSize,
          cursor: pageParam,
        });
      },
      select: (data) => ({
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter(
            (item) =>
              item.moderation?.moderationStatus ===
              reviews.ModerationModerationStatus.APPROVED,
          ),
        })),
      }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.cursors.next,
    });

  const reviewItems = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="space-y-5">
      {status === "pending" && <ProductReviewsLoadingSkeleton />}
      {status === "error" && (
        <p className="text-destructive">Error fetching reviews</p>
      )}
      {status === "success" && !reviewItems.length && !hasNextPage && (
        <p>No reviews yet</p>
      )}
      <div className="divide-y">
        {reviewItems.map((review) => (
          <Review key={review._id} review={review} />
        ))}
      </div>
      {hasNextPage && (
        <LoadingButton
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more reviews
        </LoadingButton>
      )}
    </div>
  );
}

interface ReviewProps {
  review: reviews.Review;
}

function Review({
  review: { author, reviewDate, content, reply },
}: ReviewProps) {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={cn(
                "size-5 text-primary",
                i < (content?.rating || 0) && "fill-primary",
              )}
            />
          ))}
          {content?.title && <h3 className="font-bold">{content.title}</h3>}
        </div>
        <p className="text-sm text-muted-foreground">
          by {author?.authorName || "Anonymous"}
          {reviewDate && <> on {new Date(reviewDate).toLocaleDateString()}</>}
        </p>
        {content?.body && (
          <div className="whitespace-pre-line">{content.body}</div>
        )}
        {!!content?.media?.length && (
          <div className="flex flex-wrap gap-2">
            {content.media.map((media) => (
              <MediaAttachment key={media.image || media.video} media={media} />
            ))}
          </div>
        )}
      </div>
      {reply?.message && (
        <div className="ms-10 mt-2.5 space-y-1 border-t pt-2.5">
          <div className="flex items-center gap-2">
            <CornerDownRight className="size-5" />
            <Image
              src={logo}
              alt="Hcoff Store logo"
              width={24}
              height={24}
              className="size-5"
            />
            <span className="font-bold">Hcoff Store Team</span>
          </div>
          <div className="whitespace-pre-line">{reply.message}</div>
        </div>
      )}
    </div>
  );
}

export function ProductReviewsLoadingSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div className="space-y-1.5" key={i}>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16 w-72" />
        </div>
      ))}
    </div>
  );
}

interface MediaAttachmentProps {
  media: reviews.Media;
}
function MediaAttachment({ media }: MediaAttachmentProps) {
  if (media.image) {
    const image = wixMedia.getImageUrl(media.image);
    return (
      <Zoom>
        <Image
          src={image.url}
          alt={image.altText || "Review Image"}
          width={1280}
          height={720}
          className="size-28 object-cover"
        />
      </Zoom>
    );
  }

  if (media.video) {
    const videoUrl = wixMedia.getVideoUrl(media.video).url;

    return <VideoPreview videoUrl={videoUrl} />;
  }

  return <span className="text-destructive">Unsupported media type</span>;
}

function VideoPreview({ videoUrl }: { videoUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<ElementRef<"video">>(null);

  useEffect(() => {
    const video = videoRef.current;

    const onFullScreenExit = () => {
      if (!document.fullscreenElement) {
        setIsPlaying(false);
        video!.pause();
        video!.currentTime = 1;
      }
    };

    if (video) {
      video.currentTime = 1;
      video.addEventListener("fullscreenchange", onFullScreenExit);
    }

    return () =>
      video?.removeEventListener("fullscreenchange", onFullScreenExit);
  }, []);

  function handleClick() {
    setIsPlaying(true);
    const video = videoRef.current;
    if (video) {
      video.requestFullscreen();
      video.currentTime = 0;
      video.play();
    }
  }

  return (
    <div
      className="group relative bg-black"
      onClick={handleClick}
      role="button"
    >
      <video
        ref={videoRef}
        className={cn(
          "size-28 object-cover opacity-80 transition-opacity group-hover:opacity-50",
          isPlaying && "cursor-default",
        )}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <Play
        size={24}
        color="whitesmoke"
        className="absolute bottom-0.5 left-0.5 group-hover:hidden"
      />

      <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <Play color="whitesmoke" className="size-12" />
      </div>
    </div>
  );
}
