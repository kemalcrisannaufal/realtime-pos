"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-actions";
import { Button } from "@/components/ui/button";
import {
  HEADER_TABLE_DETAIL_ORDER,
  ORDERS_MENUS_STATUS,
} from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";

import { cn, convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { toast, Toaster } from "sonner";
import Summary from "./summary";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { updateStatusOrderItem } from "../../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { useAuthStore } from "@/stores/auth-store";
import { createClientSupabase } from "@/lib/supabase/default";

export default function DetailOrder({ id }: { id: string }) {
  const supabase = createClientSupabase();
  const { currentLimit, currentPage, handleChangePage, handleChangeLimit } =
    useDataTable();

  const { data: order } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const result = await supabase
        .from("orders")
        .select("id, customer_name, status, payment_token, tables (name, id)")
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

  const {
    data: orderMenu,
    isLoading,
    refetch: refetchOrderMenu,
  } = useQuery({
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

  useEffect(() => {
    if (!order?.id) return;
    const channel = supabase
      .channel("change-order")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders_menus",
          filter: `order_id=eq.${order.id}`,
        },
        () => {
          refetchOrderMenu();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const [updateStatusOrderState, updateStatusOrderAction] = useActionState(
    updateStatusOrderItem,
    INITIAL_STATE_ACTION
  );

  const handleUpdateStatusOrder = async ({
    id,
    status,
  }: {
    id: string;
    status: string;
  }) => {
    const formData = new FormData();
    formData.append("status", status);
    formData.append("id", id);

    startTransition(() => {
      updateStatusOrderAction(formData);
    });
  };

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
            "bg-green-500": orderMenu.status === "served",
          })}
        >
          {orderMenu.status}
        </div>,
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ORDERS_MENUS_STATUS.map((status, index) => {
              if (status === orderMenu.status && status !== "served") {
                const nextStatus = ORDERS_MENUS_STATUS[index + 1];
                return (
                  <DropdownMenuItem
                    key={`status-${status}`}
                    className={cn("capitalize")}
                    onClick={() =>
                      handleUpdateStatusOrder({
                        id: orderMenu.id,
                        status: nextStatus,
                      })
                    }
                  >
                    {nextStatus}
                  </DropdownMenuItem>
                );
              }
            })}
          </DropdownMenuContent>
        </DropdownMenu>,
      ];
    });
  }, [orderMenu]);

  const totalPages = useMemo(() => {
    return orderMenu && orderMenu.count !== null
      ? Math.ceil(orderMenu.count / currentLimit)
      : 0;
  }, [orderMenu]);

  useEffect(() => {
    if (updateStatusOrderState.status === "error") {
      toast.error("Update Status Order Menu Failed.", {
        description: updateStatusOrderState.errors?._form?.[0],
      });
    }

    if (updateStatusOrderState.status === "success") {
      toast.success("Update Status Order Menu Success.");
    }
  }, [updateStatusOrderState]);

  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center gap-4">
        <h1 className="font-bold text-2xl">Detail Order</h1>

        {profile.role !== "kitchen" && (
          <Link href={`/order/${id}/add`}>
            <Button>Add Order Item</Button>
          </Link>
        )}
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
          <Summary order={order} orderMenu={orderMenu?.data} id={id} />
        </div>
      </div>
    </div>
  );
}
