import { getAllCollections } from "@/wix-api/collections";
import SearchFilterLayout from "./SearchFilterLayout";
import { getWixServerClient } from "@/lib/wix-client-server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getAllCollections(getWixServerClient(), [
    "all-products",
    "featured-products",
  ]);

  return (
    <SearchFilterLayout collections={collections}>
      {children}
    </SearchFilterLayout>
  );
}
