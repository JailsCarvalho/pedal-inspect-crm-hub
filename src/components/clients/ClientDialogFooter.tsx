
import React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClientDialogFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const ClientDialogFooter: React.FC<ClientDialogFooterProps> = ({
  isSubmitting,
  onCancel,
}) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar Cliente"}
      </Button>
    </DialogFooter>
  );
};
