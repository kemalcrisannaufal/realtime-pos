import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useDebounce from "@/hooks/use-debounce";
import { convertIDR } from "@/lib/utils";
import { Cart } from "@/types/order";
import { Menu } from "@/validations/menu-validation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

export default function CartSection({
  order,
  cart,
  setCart,
  onAddToCart,
  onOrder,
  isLoadingAddOrder,
}: {
  order:
    | {
        customer_name: string;
        tables: { name: string }[];
        status: string;
      }
    | undefined
    | null;
  cart: Cart[];
  setCart: Dispatch<SetStateAction<Cart[]>>;
  onAddToCart: (menu: Menu, action: "increment" | "decrement") => void;
  onOrder: () => void;
  isLoadingAddOrder: boolean;
}) {
  const debounce = useDebounce();

  const handleAddNotes = (menu_id: string, notes: string) => {
    setCart(
      cart.map((item) => {
        if (item.menu_id === menu_id) {
          return { ...item, notes };
        }
        return item;
      })
    );
  };

  return (
    <Card className="shadow-sm w-full">
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
        <h3 className="font-semibold text-lg">Cart</h3>

        {cart.length === 0 && (
          <div className="text-center">No items in cart</div>
        )}

        <div className="space-y-4">
          {cart.map((item) => (
            <div key={`cart-item-${item.menu_id}`} className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={item.menu.image_url}
                    alt={item.menu.name}
                    width={50}
                    height={50}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{item.menu.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {convertIDR(item.menu.price)}
                    </p>
                  </div>
                </div>

                <div className="font-semibold text-xl">
                  {convertIDR(item.total)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Add notes"
                  onChange={(e) => {
                    debounce(() => {
                      handleAddNotes(item.menu_id, e.target.value);
                    }, 500);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => onAddToCart(item.menu, "decrement")}
                >
                  -
                </Button>
                <span className="rounded-lg text-muted-foreground">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  onClick={() => onAddToCart(item.menu, "increment")}
                >
                  +
                </Button>
              </div>
            </div>
          ))}

          <Button className="bg-teal-500 w-full" onClick={onOrder}>
            {isLoadingAddOrder ? <Loader2 className="animate-spin" /> : "Order"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
