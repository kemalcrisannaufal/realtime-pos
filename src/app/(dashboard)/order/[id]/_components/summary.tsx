import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePricing } from "@/hooks/use-pricing";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { generatePayment } from "../../actions";
import { INITIAL_STATE_GENERATE_PAYMENT } from "@/constants/order-constant";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function Summary({
  order,
  orderMenu,
  id,
}: {
  order:
    | {
        customer_name: string;
        tables: { name: string }[];
        status: string;
      }
    | null
    | undefined;
  orderMenu:
    | { menus: Menu; quantity: number; status: string }[]
    | null
    | undefined;
  id: string;
}) {
  const { totalPrice, tax, service, grandTotal } = usePricing(orderMenu);

  const profile = useAuthStore((state) => state.profile);

  const isAllServed = useMemo(() => {
    return (
      orderMenu?.every(({ status }) => status === "served") &&
      orderMenu.length > 0
    );
  }, [orderMenu]);

  const [
    generatePaymentState,
    generatePaymentAction,
    isPendingGeneratePayment,
  ] = useActionState(generatePayment, INITIAL_STATE_GENERATE_PAYMENT);

  const handleGeneratePayment = () => {
    const formData = new FormData();
    formData.append("id", id || "");
    formData.append("gross_amount", grandTotal.toString());
    formData.append("customer_name", order?.customer_name || "");

    startTransition(() => {
      generatePaymentAction(formData);
    });
  };

  useEffect(() => {
    if (generatePaymentState.status === "error") {
      toast.error("Generate Payment Failed.", {
        description: generatePaymentState.errors?._form?.[0],
      });
    }

    if (generatePaymentState.status === "success") {
      window.snap.pay(generatePaymentState.data.payment_token);
    }
  }, [generatePaymentState]);

  return (
    <Card>
      <CardContent className="space-y-4">
        <h3 className="font-bold text-lg">Customer Information</h3>
        {order ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={order.customer_name} disabled />
            </div>

            <div className="space-y-2">
              <Label>Table</Label>
              <Input
                value={(order.tables as unknown as { name: string }).name}
                disabled
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-24">
            No Data Available
          </div>
        )}

        <Separator />

        <h3 className="font-bold text-lg">Order Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p>Subtotal</p>
            <p>{convertIDR(totalPrice)}</p>
          </div>

          <div className="flex justify-between items-center">
            <p>Tax (12%)</p>
            <p>{convertIDR(tax)}</p>
          </div>

          <div className="flex justify-between items-center">
            <p>Service (5%)</p>
            <p>{convertIDR(service)}</p>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <p>Total</p>
            <p>{convertIDR(grandTotal)}</p>
          </div>

          {profile.role !== "kitchen" && order?.status === "process" && (
            <Button
              type="submit"
              onClick={handleGeneratePayment}
              className="bg-teal-500 hover:bg-teal-600 w-full font-semibold text-white cursor-pointer"
              disabled={!isAllServed || isPendingGeneratePayment}
            >
              {isPendingGeneratePayment ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Pay"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
