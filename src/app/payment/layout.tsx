import { DarkModeToggle } from "@/components/common/darkmode-toggle";
import { ReactNode } from "react";

type PaymentStatusLayoutProps = {
  children: ReactNode;
};

export default function PaymentStatusLayout({
  children,
}: PaymentStatusLayoutProps) {
  return (
    <div className="relative flex flex-col justify-center items-center gap-6 bg-muted p-6 md:p-10 w-full min-h-svh">
      <div className="top-4 right-4 absolute">
        <DarkModeToggle />
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
