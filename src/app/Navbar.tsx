import logo from "@/assets/logo.png";
import { getCart } from "@/wix-api/cart";
import { getLoggedInMember } from "@/wix-api/members";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartButton } from "./ShoppingCartButton";
import { UserButton } from "@/components/UserButton";
import { getAllCollections, getCollectionBySlug } from "@/wix-api/collections";
import MainNavigation from "./MainNavigation";
import SearchField from "@/components/SearchField";
import { MobileMenu } from "./MobileMenu";
import { getWixClient } from "@/lib/wix.server";

export default async function Navbar() {
  const wixClient = getWixClient();

  const [cart, loggedInMember, collections] = await Promise.all([
    getCart(wixClient),
    getLoggedInMember(wixClient),
    getAllCollections(wixClient, ["all-products", "featured-products"]),
  ]);

  return (
    <header className="bg-background shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 p-5">
        <MobileMenu collections={collections} loggedInMember={loggedInMember} />
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/" className="flex items-center gap-4">
            <Image src={logo} alt="Hcoff Store logo" width={40} height={40} />
            <span className="text-xl font-bold">Hcoff Store</span>
          </Link>
          <MainNavigation
            className="hidden lg:inline-flex"
            collections={collections}
          />
        </div>
        <SearchField className="hidden max-w-96 lg:inline" />
        <div className="flex items-center justify-center gap-5">
          <UserButton
            className="hidden lg:inline-flex"
            loggedInMember={loggedInMember}
          />
          <ShoppingCartButton initialData={cart} />
        </div>
      </div>
    </header>
  );
}
