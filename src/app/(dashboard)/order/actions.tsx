"use server";

import { createClient } from "@/lib/supabase/server";
import { FormState } from "@/types/general";
import { Cart, OrderFormState } from "@/types/order";
import { orderFormSchema } from "@/validations/order-validation";
import { redirect } from "next/navigation";
import midtrans from "midtrans-client";
import { environment } from "@/configs/environment";

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

export async function updateReservation(
  prevState: OrderFormState,
  formData: FormData
) {
  const id = formData.get("id");
  const tableId = formData.get("tableId");
  const status = formData.get("status");

  const supabase = await createClient();

  const queryOrder = supabase.from("orders").update({ status }).eq("id", id);
  const queryTable = supabase
    .from("tables")
    .update({ status: status === "process" ? "unavailable" : "available" })
    .eq("id", tableId);

  const [orderResult, tableResult] = await Promise.all([
    queryOrder,
    queryTable,
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

export async function addOrderItem(
  prevState: OrderFormState,
  data: { order_id: string; items: Cart[] }
) {
  const supabase = await createClient();

  const payload = data.items.map(({ menu, total, ...item }) => ({ ...item }));

  const { error } = await supabase.from("orders_menus").insert(payload);
  console.log(error?.message);

  if (error) {
    return {
      status: "error",
      errors: {
        _form: [error.message],
      },
    };
  }

  redirect(`/order/${data.order_id}`);
}

export async function updateStatusOrderItem(
  prevState: OrderFormState,
  formData: FormData
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders_menus")
    .update({ status: formData.get("status") })
    .eq("id", formData.get("id"));

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function generatePayment(
  prevState: FormState,
  formData: FormData
) {
  const supabase = await createClient();

  const orderId = formData.get("id");
  const grossAmount = formData.get("gross_amount");
  const customerName = formData.get("customer_name");

  const snap = new midtrans.Snap({
    isProduction: false,
    serverKey: environment.MIDTRANS_SERVER_KEY!,
  });

  const parameter = {
    transaction_details: {
      order_id: `${orderId}`,
      gross_amount: parseFloat(grossAmount as string),
    },
    customer_details: {
      first_name: customerName,
    },
  };

  const result = await snap.createTransaction(parameter);

  if (result.error_messages) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [result.error_messages],
      },
      data: {
        payment_token: "",
      },
    };
  }

  await supabase
    .from("orders")
    .update({ payment_token: result.token })
    .eq("order_id", orderId);

  return {
    status: "success",
    data: {
      payment_token: `${result.token}`,
    },
  };
}
