
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
      
      // Format birthdate correctly for database insertion
      const formattedBirthdate = values.birthdate 
        ? format(values.birthdate, "yyyy-MM-dd") 
        : null;
      
      const { error } = await supabase.from("customers").insert({
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        birthdate: formattedBirthdate,
        address: values.address || null,
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

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
