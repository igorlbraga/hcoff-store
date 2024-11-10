import { getAllCollections } from "@/wix-api/collections";
import SearchFilterLayout from "./SearchFilterLayout";
import { getWixClient } from "@/lib/wix.browser";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getAllCollections(getWixClient(), [
    "all-products",
    "featured-products",
  ]);

  return (
    <SearchFilterLayout collections={collections}>
      {children}
    </SearchFilterLayout>
  );
}
