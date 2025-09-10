import DialogDelete from "@/components/common/dialog-delete";
import { Menu } from "@/validations/menu-validation";
import { startTransition, useActionState, useEffect } from "react";
import { deleteMenu } from "../actions";
import { INITIAL_STATE_MENU } from "@/constants/menu-constant";
import { toast } from "sonner";

export default function DialogDeleteMenu({
  currentData,
  refetch,
  open,
  handleChangeAction,
}: {
  currentData?: Menu;
  refetch: () => void;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const [deleteMenuState, deleteMenuAction, isPendingDeleteMenu] =
    useActionState(deleteMenu, INITIAL_STATE_MENU);

  function onSubmit() {
    const formData = new FormData();

    formData.append("id", currentData?.id as string);
    formData.append("image_url", currentData?.image_url as string);

    startTransition(() => {
      deleteMenuAction(formData);
    });
  }

  useEffect(() => {
    if (deleteMenuState.status === "error") {
      toast.error("Delete Menu Failed.", {
        description: deleteMenuState.errors?._form?.[0],
      });
    }

    if (deleteMenuState.status === "success") {
      toast.success("Delete Menu Success.");
      handleChangeAction(false);
      refetch();
    }
  }, [deleteMenuState]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      onSubmit={onSubmit}
      title="Menu"
      isLoading={isPendingDeleteMenu}
    />
  );
}
