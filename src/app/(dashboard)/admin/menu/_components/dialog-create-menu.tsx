import {
  INITIAL_STATE_CREATE_MENU_FORM,
  INITIAL_STATE_MENU,
} from "@/constants/menu-constant";
import { menuFormSchema } from "@/validations/menu-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormMenu from "./form-menu";
import { startTransition, useActionState, useEffect, useState } from "react";
import { Preview } from "@/types/general";
import { createMenu } from "../actions";
import { toast } from "sonner";

export default function DialogCreateMenu({ refetch }: { refetch: () => void }) {
  const form = useForm({
    resolver: zodResolver(menuFormSchema),
    defaultValues: INITIAL_STATE_CREATE_MENU_FORM,
  });

  const [preview, setPreview] = useState<Preview | undefined>(undefined);

  const [createMenuState, createMenuAction, isPendingCreateMenu] =
    useActionState(createMenu, INITIAL_STATE_MENU);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).map(([key, value]) => {
      formData.append(key, key === "image_url" ? preview!.file ?? "" : value);
    });

    startTransition(() => {
      createMenuAction(formData);
    });
  });

  useEffect(() => {
    if (createMenuState.status === "error") {
      toast.error("Create Menu Failed.", {
        description: createMenuState.errors?._form?.[0],
      });
    }

    console.log(form.formState.errors);

    if (createMenuState.status === "success") {
      toast.success("Create Menu Success.");
      form.reset();
      setPreview(undefined);
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createMenuState]);

  return (
    <FormMenu
      form={form}
      onSubmit={onSubmit}
      isLoading={isPendingCreateMenu}
      type="Create"
      preview={preview}
      setPreview={setPreview}
    />
  );
}
