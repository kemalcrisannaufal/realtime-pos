"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_TABLE_ORDER } from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import DialogCreateOrder from "./dialog-create-order";
import { Table } from "@/validations/table-validation";
import { Ban, Link2Icon, ScrollText } from "lucide-react";
import Link from "next/link";
import { updateReservation } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";

export default function OrderManagement() {
  const supabase = createClient();
  const {
    currentLimit,
    currentPage,
    currentSearch,
    handleChangeLimit,
    handleChangePage,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: orders,
    isLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", currentLimit, currentPage, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("orders")
        .select("id, order_id, customer_name, status, tables (id, name)", {
          count: "exact",
        })
        .range((currentPage - 1) * currentLimit, currentLimit * currentPage - 1)
        .order("created_at");

      if (currentSearch) {
        query.or(
          `order_id.ilike.%${currentSearch}%,customer_name.ilike.%${currentSearch}`
        );
      }

      const result = await query;

      if (result.error) {
        toast.error("Get Order Data Failed", {
          description: result.error.message,
        });
      }

      return result;
    },
  });

  const { data: tables, refetch: refetchTables } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const result = await supabase
        .from("tables")
        .select("*")
        .eq("status", "available")
        .order("created_at");

      return result.data as Table[];
    },
  });

  const [reservedState, reservedAction] = useActionState(
    updateReservation,
    INITIAL_STATE_ACTION
  );

  const handleReservation = ({
    id,
    tableId,
    status,
  }: {
    id: string;
    tableId: string;
    status: string;
  }) => {
    const formData = new FormData();
    Object.entries({ id, tableId, status }).map(([key, value]) => {
      formData.append(key, value);
    });

    startTransition(() => {
      reservedAction(formData);
    });
  };

  const reservedActionList = [
    {
      label: (
        <span className="flex items-center gap-2">
          <Link2Icon />
          Process
        </span>
      ),
      action: (id: string, tableId: string, status?: string) =>
        handleReservation({ id, tableId, status: "process" }),
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Ban className="text-red-500" />
          Cancel
        </span>
      ),
      action: (id: string, tableId: string, status?: string) => {
        handleReservation({ id, tableId, status: "canceled" });
      },
    },
  ];

  const filteredData = useMemo(() => {
    return (orders?.data ?? []).map((order, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        order.order_id,
        order.customer_name,
        (order.tables as unknown as { name: string }).name,
        <div
          className={cn("px-3 py-1 rounded-full w-fit text-white capitalize", {
            "bg-lime-600": order.status === "settled",
            "bg-sky-600": order.status === "process",
            "bg-amber-600": order.status === "reserved",
            "bg-red-600": order.status === "canceled",
          })}
        >
          {order.status}
        </div>,
        <DropdownAction
          menu={
            order.status === "reserved"
              ? reservedActionList.map((item) => ({
                  label: item.label,
                  action: () =>
                    item.action(
                      order.id,
                      (order.tables as unknown as { id: string }).id
                    ),
                }))
              : [
                  {
                    label: (
                      <Link
                        href={`/order/${order.order_id}`}
                        className="flex items-center gap-2"
                      >
                        <ScrollText />
                        Detail
                      </Link>
                    ),
                    type: "link",
                  },
                ]
          }
        />,
      ];
    });
  }, [orders]);

  const totalPages = useMemo(() => {
    return orders && orders.count !== null
      ? Math.ceil(orders.count / currentLimit)
      : 0;
  }, [orders]);

  const refetch = () => {
    refetchOrders();
    refetchTables();
  };

  useEffect(() => {
    if (reservedState.errors) {
      toast.error("Update Status Failed.", {
        description: reservedState.errors._form?.[0],
      });
    }

    if (reservedState.status === "success") {
      toast.success("Update Status Success.");
      refetch();
    }
  }, [reservedState]);

  return (
    <div className="w-full">
      <div className="flex lg:flex-row flex-col justify-between gap-2 mb-4 w-full">
        <h1 className="font-bold text-2xl">Order Management</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Search by name"
            onChange={(e) => handleChangeSearch(e)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"}>Create</Button>
            </DialogTrigger>
            <DialogCreateOrder refetch={refetch} tables={tables} />
          </Dialog>
        </div>
      </div>

      <DataTable
        data={filteredData}
        isLoading={isLoading}
        header={HEADER_TABLE_ORDER}
        currentLimit={currentLimit}
        onChangeLimit={handleChangeLimit}
        currentPage={currentPage}
        onChangePage={handleChangePage}
        totalPages={totalPages}
      />
    </div>
  );
}
