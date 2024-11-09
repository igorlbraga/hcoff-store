"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { collections } from "@wix/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import {
  ElementRef,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { ProductsSort } from "@/wix-api/products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

interface SearchFilterLayoutProps {
  collections: collections.Collection[];
  children: React.ReactNode;
}

export default function SearchFilterLayout({
  collections,
  children,
}: SearchFilterLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [optimisticFilters, setOptimisticFilters] = useOptimistic({
    collection: searchParams.getAll("collection"),
    price_min: searchParams.get("price_min") || undefined,
    price_max: searchParams.get("price_max") || undefined,
    sort: searchParams.get("sort") || "last_updated",
  });

  const [isPending, startTransition] = useTransition();

  function updateFilters(filters: Partial<typeof optimisticFilters>) {
    const newFilters = { ...optimisticFilters, ...filters };
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      newSearchParams.delete(key);

      if (Array.isArray(value))
        value.forEach((v) => newSearchParams.append(key, v));
      else if (value) newSearchParams.set(key, value);
    });

    newSearchParams.delete("page");

    startTransition(() => {
      setOptimisticFilters(newFilters);
      router.push(`?${newSearchParams.toString()}`);
    });
  }

  return (
    <main className="group flex flex-col items-center justify-center gap-10 px-5 py-10 lg:flex-row lg:items-start">
      <aside
        className="h-fit space-y-5 lg:sticky lg:top-10 lg:w-64"
        data-pending={isPending ? true : undefined}
      >
        <CollectionsFilter
          collections={collections}
          selectedCollections={optimisticFilters.collection}
          setSelectedCollections={(selectedCollections) =>
            updateFilters({ collection: selectedCollections })
          }
        />

        <PriceFilters
          defaultMinPrice={optimisticFilters.price_min}
          defaultMaxPrice={optimisticFilters.price_max}
          updatePriceRange={(priceRange) =>
            updateFilters({
              price_min: priceRange.min,
              price_max: priceRange.max,
            })
          }
        />
      </aside>
      <div className="w-full max-w-7xl space-y-5">
        <div className="flex justify-center lg:justify-end">
          <SortFilterSelect
            sort={optimisticFilters.sort as ProductsSort}
            setSort={(sort) => updateFilters({ sort })}
          />
        </div>
        {children}
      </div>
    </main>
  );
}

interface CollectionsFilterProps {
  collections: collections.Collection[];
  selectedCollections: string[];
  setSelectedCollections: (collectionIds: string[]) => void;
}
function CollectionsFilter({
  collections,
  selectedCollections,
  setSelectedCollections,
}: CollectionsFilterProps) {
  return (
    <div className="space-y-3">
      <div className="font-bold">Collections</div>
      <ul className="space-y-1.5">
        {collections.map((collection) => {
          if (!collection._id) return null;
          return (
            <li key={collection._id}>
              <Label className="flex cursor-pointer items-center gap-2 font-medium">
                <Checkbox
                  id={collection._id}
                  checked={selectedCollections.includes(collection._id)}
                  onCheckedChange={(checked) => {
                    setSelectedCollections(
                      checked
                        ? [...selectedCollections, collection._id!]
                        : selectedCollections.filter(
                            (id) => id !== collection._id,
                          ),
                    );
                  }}
                />
                <span className="line-clamp-1 break-all">
                  {collection.name}
                </span>
              </Label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface PriceFiltersProps {
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
  updatePriceRange: (priceRange: { min?: string; max?: string }) => void;
}

function PriceFilters({
  defaultMinPrice,
  defaultMaxPrice,
  updatePriceRange,
}: PriceFiltersProps) {
  const formRef = useRef<ElementRef<"form">>(null);

  const [minPrice, setMinPrice] = useState(defaultMinPrice);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);

  const debouncedupdatePriceRange = useDebouncedCallback(updatePriceRange, 300);

  useEffect(() => {
    setMinPrice(defaultMinPrice);
    setMaxPrice(defaultMaxPrice);
  }, [defaultMinPrice, defaultMaxPrice]);

  function updatePrice() {
    updatePriceRange({
      min: minPrice,
      max: maxPrice,
    });
  }

  return (
    <form ref={formRef} className="flex items-center gap-2">
      <Input
        type="number"
        className="w-20"
        onChange={(e) => {
          setMinPrice(e.target.value);
          debouncedupdatePriceRange({
            min: e.target.value,
            max: maxPrice,
          });
        }}
        value={minPrice}
        min={0}
        name="min"
        placeholder="Min"
      />
      <span>-</span>
      <Input
        type="number"
        className="w-20"
        onChange={(e) => {
          setMaxPrice(e.target.value);
          debouncedupdatePriceRange({
            min: minPrice,
            max: e.target.value,
          });
        }}
        value={maxPrice}
        name="max"
        placeholder="Max"
      />
    </form>
  );
}

interface SortFilterSelectProps {
  sort?: ProductsSort;
  setSort: (value: ProductsSort) => void;
}
function SortFilterSelect({ sort, setSort }: SortFilterSelectProps) {
  return (
    <Select value={sort || "last_updated"} onValueChange={setSort}>
      <SelectTrigger className="w-fit gap-2 text-start">
        <span>
          Sort by: <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last_updated">Newest</SelectItem>
        <SelectItem value="price_asc">Price (Low to high)</SelectItem>
        <SelectItem value="price_desc">Price (High to low)</SelectItem>
      </SelectContent>
    </Select>
  );
}
