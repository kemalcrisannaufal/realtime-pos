"use client";

import LineCharts from "@/components/common/line-chart";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const supabase = createClient();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 6);
  lastWeek.setHours(0, 0, 0, 0);
  const {
    data: orders,
    isLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["order-per-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", lastWeek.toISOString())
        .order("created_at");

      const counts: Record<string, number> = {};

      (data ?? []).forEach((order) => {
        const date = new Date(order.created_at).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
      });

      return Object.entries(counts).map(([name, total]) => ({ name, total }));
    },
  });
  return (
    <div className="w-full">
      <div className="flex lg:flex-row flex-col justify-between gap-2 mb-4 w-full">
        <h1 className="font-bold text-2xl">Dashboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Created Per Week</CardTitle>
          <CardDescription>
            Showing orders from {lastWeek.toLocaleDateString()} to{" "}
            {new Date().toLocaleDateString()}
          </CardDescription>

          <div className="p-6 w-full h-64">
            <LineCharts data={orders} />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
