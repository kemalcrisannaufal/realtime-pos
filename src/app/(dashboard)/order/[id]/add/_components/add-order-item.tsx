"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FILTER_MENU } from "@/constants/order-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { Menu } from "@/validations/menu-validation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import CardMenu from "./card-menu";
import LoadingCardMenu from "./loading-card-menu";
import CartSection from "./cart";
import { startTransition, useActionState, useEffect, useState } from "react";
import { Cart } from "@/types/order";
import { addOrderItem } from "../../../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";

export default function AddOrderItem({ id }: { id: string }) {
  const supabase = createClient();

  const {
    currentSearch,
    handleChangeSearch,
    currentFilter,
    handleChangeFilter,
  } = useDataTable();

  const { data: menus, isLoading } = useQuery({
    queryKey: ["menus", currentSearch, currentFilter],
    queryFn: async () => {
      let query = supabase
        .from("menus")
        .select("*")
        .order("created_at")
        .eq("is_available", true);

      if (currentSearch) {
        query = query.ilike("name", `%${currentSearch}%`);
      }

      if (currentFilter) {
        query = query.eq("category", currentFilter);
      }

      const result = await query;

      if (result.error) {
        toast.error("Get Menu Data Failed.", {
          description: result.error.message,
        });
      }

      return result.data as Menu[];
    },
  });

  const [cart, setCart] = useState<Cart[]>([]);

  const handleAddToCart = (menu: Menu, action: "increment" | "decrement") => {
    const menuExistInCart = cart.find(
      (cartItem) => cartItem.menu_id === menu.id
    );

    if (menuExistInCart) {
      if (menuExistInCart.quantity === 1 && action === "decrement") {
        setCart(cart.filter((cartItem) => cartItem.menu_id !== menu.id));
      } else {
        setCart(
          cart.map((cartItem) => {
            if (cartItem.menu_id === menu.id) {
              if (action === "increment") {
                cartItem.quantity++;
                cartItem.total += menu.price;
              }

              if (action === "decrement" && cartItem.quantity > 1) {
                cartItem.quantity--;
                cartItem.total -= menu.price;
              }
            }
            return cartItem;
          })
        );
      }
    } else {
      const newCartItem: Cart = {
        menu_id: menu.id,
        quantity: 1,
        total: menu.price,
        notes: "",
        menu,
        order_id: id,
      };
      setCart([...cart, newCartItem]);
    }
  };

  const { data: order } = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const result = await supabase
        .from("orders")
        .select("id, customer_name, status, tables (id, name)")
        .eq("order_id", id)
        .single();

      if (result.error) {
        toast.error("Get Order Data Failed.", {
          description: result.error.message,
        });
      }

      return result.data;
    },
  });

  const [addOrderItemState, addOrderItemAction, isPendingAddOrderItem] =
    useActionState(addOrderItem, INITIAL_STATE_ACTION);

  const handleOrder = () => {
    const payload = {
      order_id: id,
      items: cart.map((item) => ({
        ...item,
        order_id: order?.id,
        status: "pending",
      })),
    };

    startTransition(() => {
      addOrderItemAction(payload);
    });
  };

  useEffect(() => {
    if (addOrderItemState.status === "error") {
      toast.error("Add Order Item Failed", {
        description: addOrderItemState.errors._form?.[0],
      });
    }
  }, [addOrderItemState]);

  return (
    <div className="flex lg:flex-row flex-col gap-4 space-y-4 w-full">
      <div className="space-y-4 lg:w-2/3">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-2xl">Menu</h1>
          {FILTER_MENU.map((filter) => (
            <Button
              key={`filter-${filter.value}`}
              variant={filter.value === currentFilter ? "default" : "outline"}
              onClick={() => handleChangeFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
          <Input placeholder="Search..." onChange={handleChangeSearch} />
        </div>

        {isLoading ? (
          <LoadingCardMenu />
        ) : (
          <div className="gap-4 grid grid-cols-2 lg:grid-cols-3">
            {menus?.map((menu) => (
              <CardMenu
                key={menu.id}
                menu={menu}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {!isLoading && menus?.length === 0 && (
          <div className="flex justify-center items-center w-full h-24 text-muted-foreground text-xl">
            Data Not Found
          </div>
        )}
      </div>

      <div className="w-full lg:w-1/3">
        <CartSection
          order={order}
          cart={cart}
          setCart={setCart}
          onAddToCart={handleAddToCart}
          onOrder={handleOrder}
          isLoadingAddOrder={isPendingAddOrderItem}
        />
      </div>
    </div>
  );
}
