"use client";
import { StarIcon } from "lucide-react";
import { Button } from "../button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingInputProps {
  rating: number;
  setRating: (value: number) => void;
}
function StarRatingInput({ rating, setRating }: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  const ratingText = ["Terrible", "Bad", "Okay", "Good", "Great"];
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          className="pe-1"
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(i + 1)}
          type="button"
        >
          <StarIcon
            className={cn(
              "size-7 text-primary",
              (i < rating || i < hover) && "fill-primary",
            )}
          />
        </button>
      ))}
      <span>{ratingText[rating - 1]}</span>
    </div>
  );
}

export { StarRatingInput };
