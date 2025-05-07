import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ClientFormFields, formSchema } from "@/components/clients/ClientFormFields";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EditClientDrawerProps {
  client: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdated: () => void;
}

export const EditClientDrawer = ({
  client,
  open,
  onOpenChange,
  onClientUpdated
}: EditClientDrawerProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preparar dados iniciais do formulário
  const getFormDefaultValues = () => {
    if (!client) return { name: "", email: "", phone: "", birthdate: null, address: "" };

    // Converter a string de data para objeto Date se existir
    let birthdate = null;
    if (client.birthdate) {
      try {
        birthdate = new Date(client.birthdate);
        // Verificar se a data é válida
        if (isNaN(birthdate.getTime())) {
          birthdate = null;
        }
      } catch (e) {
        birthdate = null;
      }
    }

    return {
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      birthdate: birthdate,
      address: client.address || "",
    };
  };

  // Inicializar o formulário com react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(),
  });

  // Função para salvar as alterações
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!client) return;

    setIsSubmitting(true);
    try {
      // Format birthdate for database insertion
      let formattedBirthdate = null;
      if (values.birthdate) {
        try {
          formattedBirthdate = format(values.birthdate, "yyyy-MM-dd");
        } catch (error) {
          console.error("Error formatting birthdate:", error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Data inválida. Por favor verifique o formato."
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Dados para atualização
      const customerData = {
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        birthdate: formattedBirthdate,
        address: values.address || null,
      };
      
      // Atualizar cliente no Supabase
      const { error } = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", client.id);

      if (error) {
        console.error("Supabase error:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: `Não foi possível atualizar o cliente: ${error.message}`
        });
        throw error;
      }
      
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso",
      });
      
      // Fechar o drawer e atualizar os dados
      onOpenChange(false);
      onClientUpdated();
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90%] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Editar Cliente</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4 pb-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ClientFormFields form={form} />
              
              <DrawerFooter className="px-0">
                <div className="flex justify-between w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
