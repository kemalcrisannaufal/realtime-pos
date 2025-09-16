"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

export default function Home() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="flex flex-col justify-center items-center space-y-4 bg-muted h-screen">
      {profile && (
        <>
          <h1 className="font-semibold text-4xl">Welcome {profile.name}</h1>

          <Link href={profile.role === "admin" ? "/admin" : "/order"}>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white cursor-pointer">
              Access Dashboard
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
