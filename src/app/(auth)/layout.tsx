import { DarkModeToggle } from "@/components/common/darkmode-toggle";
import { Coffee } from "lucide-react";
import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex flex-col justify-center items-center gap-6 bg-muted p-6 md:p-10 w-full min-h-svh">
      <div className="top-4 right-4 absolute">
        <DarkModeToggle />
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex items-center self-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-teal-500 p-2 rounded">
            <Coffee className="size-4" />
          </div>
          WPU Cafe
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
