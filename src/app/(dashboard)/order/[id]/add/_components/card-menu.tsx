import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function CardMenu({
  menu,
  onAddToCart,
}: {
  menu: Menu;
  onAddToCart: (menu: Menu, action: "increment" | "decrement") => void;
}) {
  return (
    <Card className="gap-0 p-0 w-full h-fit">
      <Image
        src={`${menu.image_url}`}
        alt={menu.name}
        width={300}
        height={300}
        className="rounded-t-lg w-full object-cover"
      />

      <CardContent className="px-4 py-2">
        <h4 className="font-bold text-lg">{menu.name}</h4>
        <p className="h-[50px] text-muted-foreground line-clamp-2">
          {menu.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center px-4 py-2">
        <p className="font-bold text-xl">{convertIDR(menu.price)}</p>
        <Button onClick={() => onAddToCart(menu, "increment")}>
          <ShoppingCart />
        </Button>
      </CardFooter>
    </Card>
  );
}
