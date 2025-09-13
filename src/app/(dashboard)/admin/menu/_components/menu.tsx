"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "@/components/common/data-table";
import { HEADER_TABLE_MENU } from "@/constants/menu-constant";
import { useMemo, useState } from "react";
import DropdownAction from "@/components/common/dropdown-actions";
import { Pencil, Trash2 } from "lucide-react";
import { Menu } from "@/validations/menu-validation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import DialogCreateMenu from "./dialog-create-menu";
import DialogUpdateMenu from "./dialog-update-menu";
import DialogDeleteMenu from "./dialog-delete-menu";

export default function MenuManagement() {
  const supabase = createClient();

  const {
    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
    currentSearch,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: menus,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["menus", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const result = await supabase
        .from("menus")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at", { ascending: false })
        .ilike("name", `%${currentSearch}%`);

      if (result.error) {
        toast.error("Get Menu Data Failed.", {
          description: result.error.message,
        });
      }

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    type: "update" | "delete";
    data: Menu;
  } | null>(null);

  function handleChangeAction(open: boolean) {
    if (!open) setSelectedAction(null);
  }

  const filteredData = useMemo(() => {
    return (menus?.data || []).map((menu, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div className="flex items-center gap-2">
          <Image
            src={menu.image_url as string}
            alt={menu.name}
            width={50}
            height={50}
            className="rounded-lg w-15 h-15 object-cover"
          />
          {menu.name}
        </div>,
        <span className="capitalize">{menu.category}</span>,
        <div>
          <p>Base: {menu.price}</p>
          <p>Discount: {menu.discount}</p>
          <p>After Discount: {((100 - menu.discount) * menu.price) / 100}</p>
        </div>,
        <div
          className={cn("bg-teal-500 px-3 py-1 rounded-full w-fit text-white", {
            "bg-red-500": !menu.is_available,
          })}
        >
          {menu.is_available ? "Available" : "Not available"}
        </div>,
        <DropdownAction
          menu={[
            {
              label: (
                <span className="flex gap-2 item-center">
                  <Pencil />
                  Edit
                </span>
              ),
              action: () => {
                setSelectedAction({ type: "update", data: menu });
              },
            },
            {
              label: (
                <span className="flex gap-2 item-center">
                  <Trash2 className="text-red-400" />
                  Delete
                </span>
              ),
              variant: "destructive",
              action: () => {
                setSelectedAction({ type: "delete", data: menu });
              },
            },
          ]}
        />,
      ];
    });
  }, [menus]);

  const totalPages = useMemo(() => {
    return menus && menus.count !== null
      ? Math.ceil(menus?.count / currentLimit)
      : 0;
  }, [menus]);

  return (
    <div className="w-full">
      <div className="flex lg:flex-row flex-col justify-between gap-2 mb-4 w-full">
        <h1 className="font-bold text-2xl">Menu Management</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Search by name"
            onChange={(e) => handleChangeSearch(e)}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"}>Create</Button>
            </DialogTrigger>
            <DialogCreateMenu refetch={refetch} />
          </Dialog>
        </div>
      </div>

      <DataTable
        header={HEADER_TABLE_MENU}
        isLoading={isLoading}
        data={filteredData}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />

      <DialogUpdateMenu
        refetch={refetch}
        currentData={selectedAction?.data}
        open={selectedAction?.type === "update"}
        handleChangeAction={handleChangeAction}
      />

      <DialogDeleteMenu
        currentData={selectedAction?.data}
        refetch={refetch}
        open={selectedAction?.type === "delete"}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}
