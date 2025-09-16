"use client";

import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import Link from "next/link";

export default function Failed() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <Ban className="size-24 text-red-500" />
      <h1 className="font-bold text-2xl">Payment Failed</h1>
      <Link href={"/order"}>
        <Button> Back to Order</Button>
      </Link>
    </div>
  );
}
