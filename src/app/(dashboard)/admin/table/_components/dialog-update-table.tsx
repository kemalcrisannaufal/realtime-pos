import { Dialog } from "@/components/ui/dialog";
import FormTable from "./form-table";
import { Table, tableFormSchema } from "@/validations/table-validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { updateTable } from "../actions";
import { INITIAL_STATE_TABLE } from "@/constants/table-constant";
import { toast } from "sonner";

export default function DialogUpdateTable({
  open,
  handleChangeAction,
  currentData,
  refetch,
}: {
  open: boolean;
  handleChangeAction: (open: boolean) => void;
  currentData?: Table;
  refetch: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(tableFormSchema),
  });

  const [updateTableState, updateTableAction, isPendingUpdateTable] =
    useActionState(updateTable, INITIAL_STATE_TABLE);

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).map(([key, value]) => {
      formData.append(key, value);
    });

    formData.append("id", currentData?.id as string);

    startTransition(() => {
      updateTableAction(formData);
    });
  });

  useEffect(() => {
    if (updateTableState.status === "error") {
      toast.error("Update Table Failed.", {
        description: updateTableState.errors?._form?.[0],
      });
    }

    if (updateTableState.status === "success") {
      toast.success("Update Table Success.");
      handleChangeAction(false);
      refetch();
    }
  }, [updateTableState]);

  useEffect(() => {
    if (currentData) {
      form.setValue("name", currentData?.name);
      form.setValue("description", currentData?.description);
      form.setValue("capacity", currentData?.capacity.toString());
      form.setValue("status", currentData?.status);
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormTable
        form={form}
        isLoading={isPendingUpdateTable}
        onSubmit={onSubmit}
        type="Update"
      />
    </Dialog>
  );
}
