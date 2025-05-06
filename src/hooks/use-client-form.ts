
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { formSchema } from "@/components/clients/ClientFormFields";

interface UseClientFormProps {
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export const useClientForm = ({ onSuccess, onOpenChange }: UseClientFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting form with values:", values);
      
      // Formatar a data para inserção no banco de dados
      let formattedBirthdate = null;
      if (values.birthdate) {
        try {
          formattedBirthdate = format(values.birthdate, "yyyy-MM-dd");
          console.log("Formatted birthdate:", formattedBirthdate);
        } catch (error) {
          console.error("Error formatting birthdate:", error);
        }
      }
      
      // Dados para inserção
      const customerData = {
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        birthdate: formattedBirthdate,
        address: values.address || null,
      };
      
      console.log("Inserting customer data:", customerData);
      
      const { error, data } = await supabase
        .from("customers")
        .insert(customerData)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Customer created successfully:", data);
      
      toast({
        title: "Cliente criado",
        description: "Cliente foi adicionado com sucesso",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o cliente. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    onSubmit,
    isSubmitting
  };
};
