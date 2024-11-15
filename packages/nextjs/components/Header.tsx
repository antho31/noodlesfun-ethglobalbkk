"use client";

import Link from "next/link";
import { SearchBar } from "@/components/Search";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";

export const Header = () => {
  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-card dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container flex justify-between w-screen h-16 px-4">
          <NavigationMenuItem className="flex-col font-bold md:flex">
            <Link rel="noreferrer noopener" href="/" className="flex h-full grow hover:underline">
              <h1 className="items-center justify-center pl-2 mr-3 text-xl font-bold md:flex">
                🍜
                <span className="hidden ml-2 md:flex">noodles.fun</span>
              </h1>
            </Link>
          </NavigationMenuItem>

          {/* mobile */}
          <nav className="flex flex-row md:hidden grow">
            <SearchBar />
          </nav>

          {/* desktop */}
          <nav className="items-center justify-center hidden gap-2 grow md:flex">
            <SearchBar className="max-w-[500px]" />
          </nav>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
