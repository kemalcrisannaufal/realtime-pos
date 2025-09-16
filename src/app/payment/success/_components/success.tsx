"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Success() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");

  const { mutate } = useMutation({
    mutationKey: ["mutateUpdateOrderStatusToSettled"],
    mutationFn: async () => {
      const { data } = await supabase
        .from("orders")
        .update({
          status: "settled",
        })
        .eq("order_id", order_id)
        .select()
        .single();

      if (data) {
        await supabase
          .from("tables")
          .update({ status: "available" })
          .eq("id", data.table_id);
      }
    },
  });

  useEffect(() => {
    mutate();
  }, [order_id]);

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <CheckCircle className="size-24 text-green-400" />
      <h1 className="font-bold text-2xl">Payment Success</h1>
      <Link href={"/order"}>
        <Button> Back to Order</Button>
      </Link>
    </div>
  );
}
