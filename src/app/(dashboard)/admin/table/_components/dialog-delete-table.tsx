import DialogDelete from "@/components/common/dialog-delete";
import { Table } from "@/validations/table-validation";
import { startTransition, useActionState, useEffect } from "react";
import { deleteTable } from "../actions";
import { INITIAL_STATE_TABLE } from "@/constants/table-constant";
import { toast } from "sonner";

export default function DialogDeleteTable({
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
  const [deleteTableState, deleteTableAction, isPendingDeleteTable] =
    useActionState(deleteTable, INITIAL_STATE_TABLE);

  function onSubmit() {
    const formData = new FormData();
    formData.append("id", currentData?.id as string);

    startTransition(() => {
      deleteTableAction(formData);
    });
  }

  useEffect(() => {
    if (deleteTableState.status === "error") {
      toast.error("Delete Table Failed.", {
        description: deleteTableState.errors?._form?.[0],
      });
    }

    if (deleteTableState.status === "success") {
      toast.success("Delete Table Success.");
      handleChangeAction(false);
      refetch();
    }
  }, [deleteTableState]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      onSubmit={onSubmit}
      isLoading={isPendingDeleteTable}
      title="Table"
    />
  );
}
