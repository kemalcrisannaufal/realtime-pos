import { useForm } from "react-hook-form";
import FormMenu from "./form-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { Menu, menuFormSchema } from "@/validations/menu-validation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { Preview } from "@/types/general";
import { updateMenu } from "../actions";
import { INITIAL_STATE_MENU } from "@/constants/menu-constant";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";

export default function DialogUpdateMenu({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Menu;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const form = useForm({
    resolver: zodResolver(menuFormSchema),
  });

  const [preview, setPreview] = useState<Preview | undefined>(undefined);

  const [updateMenuState, updateMenuAction, isPendingUpdateMenu] =
    useActionState(updateMenu, INITIAL_STATE_MENU);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();

    if (currentData?.image_url !== data.image_url) {
      Object.entries(data).map(([key, value]) => {
        formData.append(key, key === "image_url" ? preview?.file ?? "" : value);
      });
      formData.append("old_image_url", currentData?.image_url ?? "");
    } else {
      Object.entries(data).map(([key, value]) => {
        formData.append(key, value);
      });
    }

    formData.append("id", currentData?.id as string);

    startTransition(() => {
      updateMenuAction(formData);
    });
  });

  useEffect(() => {
    if (updateMenuState.status === "error") {
      toast.error("Update Menu Failed.", {
        description: updateMenuState.errors?._form?.[0],
      });
    }

    if (updateMenuState.status === "success") {
      toast.success("Update Menu Success.");
      form.reset();
      handleChangeAction(false);
      refetch();
    }
  }, [updateMenuState]);

  useEffect(() => {
    if (currentData) {
      form.setValue("name", currentData.name);
      form.setValue("description", currentData.description);
      form.setValue("category", currentData.category);
      form.setValue("price", currentData.price.toString());
      form.setValue("discount", currentData.discount.toString());
      form.setValue("image_url", currentData.image_url);
      form.setValue(
        "is_available",
        currentData.is_available ? "true" : "false"
      );

      setPreview({
        file: new File([], currentData.image_url as string),
        displayUrl: currentData.image_url as string,
      });
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormMenu
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateMenu}
        preview={preview}
        setPreview={setPreview}
        type="Update"
      />
    </Dialog>
  );
}
