import { Menu } from "@/validations/menu-validation";
import { useMemo } from "react";

export function usePricing(
  orderMenu:
    | {
        menus: Menu;
        quantity: number;
      }[]
    | null
    | undefined
) {
  const totalPrice = useMemo(() => {
    return (
      orderMenu?.reduce((acc, curr) => {
        return acc + curr.menus.price * curr.quantity;
      }, 0) || 0
    );
  }, [orderMenu]);

  const tax = useMemo(() => {
    return totalPrice * 0.12;
  }, [orderMenu]);

  const service = useMemo(() => {
    return totalPrice * 0.05;
  }, [orderMenu]);

  const grandTotal = useMemo(() => {
    return totalPrice + tax + service;
  }, [orderMenu]);

  return {
    totalPrice,
    tax,
    service,
    grandTotal,
  };
}
