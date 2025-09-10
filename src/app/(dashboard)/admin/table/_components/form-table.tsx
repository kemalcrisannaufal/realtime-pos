import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { STATUS_TABLE_LIST } from "@/constants/table-constant";
import { Loader2 } from "lucide-react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function FormTable<T extends FieldValues>({
  form,
  type,
  isLoading,
  onSubmit,
}: {
  form: UseFormReturn<T>;
  type: "Create" | "Update";
  isLoading: boolean;
  onSubmit: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <Form {...form}>
        <DialogHeader>
          <DialogTitle>{type} Table</DialogTitle>
          <DialogDescription>
            {type === "Create" ? "Add a new table" : "Make changes table here"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormInput
            form={form}
            label="Name"
            name={"name" as Path<T>}
            placeholder="Insert name here"
          />

          <FormInput
            form={form}
            label="Description"
            name={"description" as Path<T>}
            placeholder="Insert description here"
            type="textarea"
          />

          <FormInput
            form={form}
            label="Capacity"
            name={"capacity" as Path<T>}
            placeholder="Insert capacity here"
            type="number"
          />

          <FormSelect
            form={form}
            label="Status"
            name={"status" as Path<T>}
            selectItem={STATUS_TABLE_LIST}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : type}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
