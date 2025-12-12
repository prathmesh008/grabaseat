"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "./button";
import { Separator } from "@radix-ui/react-separator";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = ({ NavigationItems}) => {
  const pathname = usePathname();

  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleSignup = () => {
    router.push('/auth/signup')
  }

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden drop-shadow-sm border-b border-zinc-200 dark:border-zinc-600 z-[9999999] lg:flex justify-between items-center px-6 text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 h-16">
        <div>
          <h1 className="text-lg font-semibold">BookMyEvent</h1>
        </div>
        <div>
          <nav>
            <ul className="flex gap-4">
              {NavigationItems.map((NavItems, index) => (
                <li key={index}>
                  <a
                    href={NavItems.url}
                    className={`flex gap-1 items-center justify-center ${(pathname === NavItems.url) ? 'text-emerald-800 dark:text-emerald-400 saturate-200' : 'text-zinc-950 dark:text-zinc-50'} `}
                  >
                    {NavItems.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex gap-1">
          <Button onClick={() => handleLogin()} className="text-xs" size="sm">
            Login
          </Button>
          <Separator />
          <Button onClick={() => handleSignup()} className="text-xs" size="sm">
            Signup
          </Button>
        </div>
      </div>

      {/* Mobile and Tabs */}
      <div className="lg:hidden flex justify-between items-center text-xs z-[9999999] h-14 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 px-4">
        <div>
          <h1>BookMyEvent</h1>
        </div>
        <div>
          <Sheet className='dark'>
            <SheetTrigger>
              <HamburgerMenuIcon />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Grab Your Seat Now</SheetTitle>
                <SheetDescription>
                  <nav>
                    <ul className="flex flex-col gap-4">
                      {NavigationItems.map((NavItems, index) => (
                        <li key={index}>
                          <a
                            href={NavItems.url}
                            className={`flex gap-1 items-center justify-center ${(pathname === NavItems.url) ? 'text-emerald-800 dark:text-emerald-400 saturate-200' : 'text-zinc-950 dark:text-zinc-50'} `}
                          >
                            {NavItems.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <hr className="my-4" />
                  <SheetClose>

                    <div className="flex flex-col gap-1">
                      <Button onClick={() => handleLogin()} className="text-xs" size="sm">
                        Login
                      </Button>
                      <Separator />
                      <Button onClick={() => handleSignup()} className="text-xs" size="sm">
                        Signup
                      </Button>
                    </div>
                  </SheetClose>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default Header;
