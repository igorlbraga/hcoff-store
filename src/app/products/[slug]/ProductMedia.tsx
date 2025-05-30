import WixImage from "@/components/WixImage";
import { cn } from "@/lib/utils";
import { media as mediaUtils } from "@wix/sdk";
import { products } from "@wix/stores";
import { PlayIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";

interface ProductMediaProps {
  mediaList: products.MediaItem[] | undefined;
}

export default function ProductMedia({ mediaList }: ProductMediaProps) {
  const [selectedMedia, setSelectedMedia] = useState(mediaList?.[0]);

  useEffect(() => {
    mediaList?.forEach((mediaItem) => {
      if (mediaItem.image?.url)
        mediaItem.image.url = mediaUtils.getScaledToFillImageUrl(
          mediaItem.image.url,
          1000,
          1000,
          {},
        );
    });
    setSelectedMedia(mediaList?.[0]);
  }, [mediaList]);

  const selectedImage = selectedMedia?.image;
  const selectedVideo = selectedMedia?.video?.files?.[0];

  if (!mediaList?.length) return null;

  return (
    <div className="h-fit basis-2/5 space-y-5 md:sticky md:top-10">
      <div className="aspect-square bg-secondary">
        {selectedImage?.url ? (
          <Zoom key={selectedImage.url}>
            <Image
              priority
              src={selectedImage.url}
              alt={selectedImage.altText || ""}
              width={1000}
              height={1000}
              className="aspect-square w-full object-cover"
            />
          </Zoom>
        ) : selectedVideo?.url ? (
          <div className="flex size-full items-center bg-black">
            <video controls className="size-full">
              <source
                src={selectedVideo.url}
                type={`video/${selectedVideo.format}`}
              />
            </video>
          </div>
        ) : null}
      </div>
      {mediaList.length > 1 && (
        <div className="flex flex-wrap gap-5">
          {mediaList.map((mediaItem, index) => (
            <MediaPreview
              key={mediaItem._id! + index}
              mediaItem={mediaItem}
              isSelected={mediaItem._id === selectedMedia?._id}
              onSelect={() => setSelectedMedia(mediaItem)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaPreviewProps {
  mediaItem: products.MediaItem;
  isSelected: boolean;
  onSelect: () => void;
}

function MediaPreview({ mediaItem, isSelected, onSelect }: MediaPreviewProps) {
  const imageUrl = mediaItem.image?.url;
  const stillFrameMediaId = mediaItem.video?.stillFrameMediaId;
  const thumbnailUrl = mediaItem.thumbnail?.url;
  const resolvedThumbnailUrl =
    stillFrameMediaId && thumbnailUrl
      ? thumbnailUrl.split(stillFrameMediaId)[0] + stillFrameMediaId
      : undefined;

  if (!imageUrl && !resolvedThumbnailUrl) return null;

  return (
    <div
      className={cn(
        "relative size-24 cursor-pointer bg-secondary",
        isSelected && "outline outline-1 outline-primary",
      )}
    >
      <Image
        src={imageUrl || resolvedThumbnailUrl!}
        alt={
          mediaItem.image?.altText || mediaItem.video?.files?.[0].altText || ""
        }
        width={100}
        height={100}
        className="size-full object-cover"
        onMouseEnter={onSelect}
      />
      {resolvedThumbnailUrl && (
        <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40">
          <PlayIcon className="size-5 text-white/60" />
        </span>
      )}
    </div>
  );
}
