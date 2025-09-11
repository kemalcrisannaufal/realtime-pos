import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePricing } from "@/hooks/use-pricing";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";

export default function Summary({
  order,
  orderMenu,
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
}) {
  const { totalPrice, tax, service, grandTotal } = usePricing(orderMenu);
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
        </div>
      </CardContent>
    </Card>
  );
}
