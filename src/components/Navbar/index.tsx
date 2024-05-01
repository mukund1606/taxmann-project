"use client";
import NextLink from "next/link";

import { ThemeToggle } from "@/components/ThemeSwitcher";
import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Nav({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar shouldHideOnScroll onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="flex gap-2">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit">Support Ticketing System</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="flex gap-12" justify="end">
        <div className="hidden gap-8 lg:flex">
          <NavbarItem isActive={pathname === "/"}>
            <Link
              as={NextLink}
              color={pathname === "/" ? "primary" : "foreground"}
              href="/"
              className="transition-all duration-400 hover:text-primary"
            >
              Home
            </Link>
          </NavbarItem>
          {session ? (
            <NavbarItem>
              <Popover placement="bottom">
                <PopoverTrigger>
                  <p className="cursor-pointer transition-all duration-400 hover:text-primary">
                    Logout
                  </p>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-2 p-3">
                  <p>Are you sure you want to logout?</p>
                  <Button
                    color="danger"
                    className="w-full"
                    onPress={async () => {
                      await signOut({ callbackUrl: "/" });
                    }}
                  >
                    Logout
                  </Button>
                </PopoverContent>
              </Popover>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Link
                as={NextLink}
                color={pathname === "/login" ? "primary" : "foreground"}
                href="/login"
                className="transition-all duration-400 hover:text-primary"
              >
                Login
              </Link>
            </NavbarItem>
          )}
        </div>
        <ThemeToggle />
      </NavbarContent>
      <NavbarMenu className="items-center pt-8">
        <NavbarMenuItem isActive={pathname === "/"}>
          <Link
            as={NextLink}
            color={pathname === "/" ? "primary" : "foreground"}
            href="/"
            className="transition-all duration-400 hover:text-primary"
          >
            Home
          </Link>
        </NavbarMenuItem>
        {session ? (
          <NavbarMenuItem>
            <Popover placement="bottom">
              <PopoverTrigger>
                <p className="cursor-pointer transition-all duration-400 hover:text-primary">
                  Logout
                </p>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-2 p-3">
                <p>Are you sure you want to logout?</p>
                <Button
                  color="danger"
                  onPress={async () => {
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  Logout
                </Button>
              </PopoverContent>
            </Popover>
          </NavbarMenuItem>
        ) : (
          <NavbarMenuItem>
            <Link
              as={NextLink}
              color={pathname === "/login" ? "primary" : "foreground"}
              href="/login"
              className="transition-all duration-400 hover:text-primary"
            >
              Login
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </Navbar>
  );
}
