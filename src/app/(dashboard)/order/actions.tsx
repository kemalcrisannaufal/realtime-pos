"use server";

import { createClient } from "@/lib/supabase/server";
import { OrderFormState } from "@/types/order";
import { orderFormSchema } from "@/validations/order-validation";

export async function createOrder(
  prevState: OrderFormState,
  formData: FormData
) {
  const validatedFields = orderFormSchema.safeParse({
    customer_name: formData.get("customer_name"),
    table_id: formData.get("table_id"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const orderID = `KCR-${Date.now()}`;
  const [orderResult, tableResult] = await Promise.all([
    supabase.from("orders").insert({
      customer_name: validatedFields.data.customer_name,
      table_id: validatedFields.data.table_id,
      status: validatedFields.data.status,
      order_id: orderID,
    }),

    supabase
      .from("tables")
      .update({
        status:
          validatedFields.data.status === "reserved"
            ? "reserved"
            : "unavailable",
      })
      .eq("id", validatedFields.data.table_id),
  ]);

  if (orderResult.error || tableResult.error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [
          ...(orderResult.error ? [orderResult.error.message] : []),
          ...(tableResult.error ? [tableResult.error.message] : []),
        ],
      },
    };
  }

  return {
    status: "success",
  };
}
