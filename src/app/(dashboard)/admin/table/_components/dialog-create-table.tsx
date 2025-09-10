import { useForm } from "react-hook-form";
import FormTable from "./form-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { tableFormSchema } from "@/validations/table-validation";
import { INITIAL_STATE_TABLE, INITIAL_TABLE } from "@/constants/table-constant";
import { startTransition, useActionState, useEffect } from "react";
import { createTable } from "../actions";
import { toast } from "sonner";

export default function DialogCreateTable({
  refetch,
}: {
  refetch: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(tableFormSchema),
    defaultValues: INITIAL_TABLE,
  });

  const [createTableState, createTableAction, isPendingCreateTable] =
    useActionState(createTable, INITIAL_STATE_TABLE);

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).map(([key, value]) => {
      formData.append(key, value);
    });

    startTransition(() => {
      createTableAction(formData);
    });
  });

  useEffect(() => {
    if (createTableState.status === "error") {
      toast.error("Create Table Failed.", {
        description: createTableState.errors?._form?.[0],
      });
    }

    if (createTableState.status === "success") {
      toast.success("Create Table Success.");
      form.reset();
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createTableState]);

  return (
    <FormTable
      form={form}
      type="Create"
      isLoading={isPendingCreateTable}
      onSubmit={onSubmit}
    />
  );
}
