import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  INITIAL_ORDER,
  INITIAL_STATE_ORDER,
  STATUS_CREATE_ORDER,
} from "@/constants/order-constant";
import { orderFormSchema } from "@/validations/order-validation";
import { Table } from "@/validations/table-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createOrder } from "../actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DialogCreateOrder({
  refetch,
  tables,
}: {
  refetch: () => void;
  tables: Table[] | undefined;
}) {
  const form = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: INITIAL_ORDER,
  });

  const [createOrderState, createOrderAction, isPendingCreateOrder] =
    useActionState(createOrder, INITIAL_STATE_ORDER);

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).map(([key, value]) => {
      return formData.append(key, value);
    });

    startTransition(() => {
      createOrderAction(formData);
    });
  });

  useEffect(() => {
    if (createOrderState.errors) {
      toast.error("Create Order Failed.", {
        description: createOrderState.errors?._form?.[0],
      });
    }

    if (createOrderState.status === "success") {
      toast.success("Create Order Success");
      form.reset();
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createOrderState]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <Form {...form}>
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>Make a new order from customer</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormInput
            form={form}
            label="Customer Name"
            name="customer_name"
            placeholder="Insert customer name here"
          />

          <FormSelect
            form={form}
            label="Table"
            name="table_id"
            selectItem={(tables ?? []).map((table) => ({
              value: `${table.id}`,
              label: `${table.name} - ${table.status} (${table.capacity})`,
            }))}
          />

          <FormSelect
            form={form}
            label="Status"
            name="status"
            selectItem={STATUS_CREATE_ORDER}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPendingCreateOrder}>
              {isPendingCreateOrder ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
