
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ClientFormFields, formSchema } from "./ClientFormFields";
import { ClientDialogFooter } from "./ClientDialogFooter";
import { useClientForm } from "@/hooks/use-client-form";
import * as z from "zod";

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: () => void;
}

export const NewClientDialog: React.FC<NewClientDialogProps> = ({
  open,
  onOpenChange,
  onClientCreated,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      taxId: "",
      email: "",
      phone: "",
      address: "",
      birthdate: null,
      notes: "",
    },
  });

  const { onSubmit, isSubmitting } = useClientForm({
    onSuccess: () => {
      form.reset();
      if (onClientCreated) {
        onClientCreated();
      }
    },
    onOpenChange
  });

  const handleFormSubmit = form.handleSubmit(onSubmit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <ClientFormFields form={form} />
            <ClientDialogFooter 
              isSubmitting={isSubmitting} 
              onCancel={() => onOpenChange(false)} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
