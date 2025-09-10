"use client";

import DataTable from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_TABLE_TABLE } from "@/constants/table-constant";
import useDataTable from "@/hooks/use-data-table";
import DialogCreateUser from "../../user/_components/dialog-create-user";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import DropdownAction from "@/components/common/dropdown-actions";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table } from "@/validations/table-validation";
import DialogCreateTable from "./dialog-create-table";
import DialogUpdateTable from "./dialog-update-table";
import DialogDeleteTable from "./dialog-delete-table";

export default function TableManagement() {
  const supabase = createClient();

  const [selectedAction, setSelectedAction] = useState<{
    type: "update" | "delete";
    data: Table;
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const {
    currentPage,
    handleChangePage,
    currentLimit,
    handleChangeLimit,
    currentSearch,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: tables,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tables", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const result = await supabase
        .from("tables")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentLimit * currentPage - 1)
        .order("created_at")
        .ilike("name", `%${currentSearch}%`);

      if (result.error) {
        toast.error("Get Table Data Failed", {
          description: result.error.message,
        });
      }

      return result;
    },
  });

  const filteredData = useMemo(() => {
    return (tables?.data ?? []).map((table: Table, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div>
          <p className="font-bold">{table.name}</p>
          <p className="text-xs">{table.description}</p>
        </div>,
        table.capacity,
        <div
          className={cn("px-2 py-1 rounded-full w-fit text-white capitalize", {
            "bg-green-600": table.status === "available",
            "bg-red-600": table.status === "unavailable",
            "bg-yellow-600": table.status === "reserved",
          })}
        >
          {table.status}
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
                setSelectedAction({ type: "update", data: table });
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
                setSelectedAction({ type: "delete", data: table });
              },
            },
          ]}
        />,
        ,
      ];
    });
  }, [tables]);

  const totalPages = useMemo(() => {
    return tables && tables.count !== null
      ? Math.ceil(tables.count / currentLimit)
      : 0;
  }, [tables]);

  return (
    <>
      <div className="flex lg:flex-row flex-col justify-between gap-2 mb-4 w-full">
        <h1 className="font-bold text-2xl">Table Management</h1>

        <div className="flex gap-2">
          <Input
            placeholder="Search by name"
            onChange={(e) => handleChangeSearch(e)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"}>Create</Button>
            </DialogTrigger>
            <DialogCreateTable refetch={refetch} />
          </Dialog>
        </div>
      </div>

      <DataTable
        header={HEADER_TABLE_TABLE}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentLimit={currentLimit}
        onChangeLimit={handleChangeLimit}
        currentPage={currentPage}
        onChangePage={handleChangePage}
      />

      <DialogUpdateTable
        open={selectedAction?.type === "update"}
        handleChangeAction={handleChangeAction}
        currentData={selectedAction?.data}
        refetch={refetch}
      />

      <DialogDeleteTable
        open={selectedAction?.type === "delete"}
        handleChangeAction={handleChangeAction}
        currentData={selectedAction?.data}
        refetch={refetch}
      />
    </>
  );
}
