"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="mx-auto max-w-lg flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Image
            src="/cow-logo_2.png"
            alt="Cow Alert logo"
            width={500}
            height={500}
            className="h-13 w-auto"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-primary-foreground">
              Cow Alert
            </h1>
            <p className="text-[11px] text-primary-foreground/60 mt-0.5">
              Laureate Park
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/admin">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <Shield className="size-3.5" />
              Admin
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
