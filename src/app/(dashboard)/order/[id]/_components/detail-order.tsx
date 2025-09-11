"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-actions";
import { Button } from "@/components/ui/button";
import { HEADER_TABLE_DETAIL_ORDER } from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { cn, convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";
import { toast } from "sonner";
import Summary from "./summary";

export default function DetailOrder({ id }: { id: string }) {
  const supabase = createClient();
  const { currentLimit, currentPage, handleChangePage, handleChangeLimit } =
    useDataTable();

  const { data: order } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const result = await supabase
        .from("orders")
        .select("id, customer_name, status, payment_url, tables (name, id)")
        .eq("order_id", id)
        .single();
      if (result.error) {
        toast.error("Get Order Data Failed", {
          description: result.error.message,
        });
      }

      return result.data;
    },
    enabled: !!id,
  });

  const { data: orderMenu, isLoading } = useQuery({
    queryKey: ["orderMenu", currentLimit, currentPage],
    queryFn: async () => {
      const result = await supabase
        .from("orders_menus")
        .select("*, menus (id, name, description, price, image_url)", {
          count: "exact",
        })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .eq("order_id", order?.id)
        .order("status");

      if (result.error) {
        toast.error("Get Order Menu Data Failed", {
          description: result.error.message,
        });
      }

      return result;
    },
    enabled: !!order?.id,
  });

  const filteredData = useMemo(() => {
    return (orderMenu?.data ?? []).map((orderMenu, index) => {
      return [
        (currentPage - 1) * currentLimit + (index + 1),
        <div className="flex items-center gap-2">
          <Image
            src={orderMenu.menus.image_url}
            alt={orderMenu.menus.name}
            width={40}
            height={40}
            className="rounded-lg w-12 h-12 object-cover"
          />
          <div>
            <p className="font-semibold">
              {orderMenu.menus.name} x {orderMenu.quantity}
            </p>
            <p className="text-xs">{orderMenu.notes ?? "No notes"}</p>
          </div>
        </div>,
        convertIDR(orderMenu.menus.price * orderMenu.quantity),
        <div
          className={cn("px-2 py-1 rounded-full w-fit text-white capitalize", {
            "bg-gray-500": orderMenu.status === "pending",
            "bg-yellow-500": orderMenu.status === "process",
            "bg-blue-500": orderMenu.status === "ready",
            "bg-green-500": orderMenu.status === "serve",
          })}
        >
          {orderMenu.status}
        </div>,
        <DropdownAction menu={[]} />,
      ];
    });
  }, [orderMenu]);

  const totalPages = useMemo(() => {
    return orderMenu && orderMenu.count !== null
      ? Math.ceil(orderMenu.count / currentLimit)
      : 0;
  }, [orderMenu]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center gap-4">
        <h1 className="font-bold text-2xl">Detail Order</h1>

        <Button>Add Order Item</Button>
      </div>

      <div className="flex lg:flex-row flex-col gap-4 w-full">
        <div className="lg:w-2/3">
          <DataTable
            data={filteredData}
            header={HEADER_TABLE_DETAIL_ORDER}
            isLoading={isLoading}
            currentLimit={currentLimit}
            onChangeLimit={handleChangeLimit}
            currentPage={currentPage}
            onChangePage={handleChangePage}
            totalPages={totalPages}
          />
        </div>
        <div className="lg:w-1/3">
          <Summary order={order} orderMenu={orderMenu?.data} />
        </div>
      </div>
    </div>
  );
}
