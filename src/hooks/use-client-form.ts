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
      
      // Format birthdate for database insertion
      let formattedBirthdate = null;
      if (values.birthdate) {
        try {
          // Handle date objects or date-like structures
          let birthdateObj;
          
          if (values.birthdate instanceof Date) {
            birthdateObj = values.birthdate;
          } else if (typeof values.birthdate === 'object' && values.birthdate !== null) {
            // Handle possible serialized date object structures
            const dateValue = values.birthdate as any;
            if (dateValue.value && (typeof dateValue.value === 'string' || typeof dateValue.value === 'number')) {
              birthdateObj = new Date(dateValue.value);
            } else if (dateValue.iso) {
              birthdateObj = new Date(dateValue.iso);
            } else {
              // Last resort - try to create a date from the object directly
              birthdateObj = new Date(values.birthdate as any);
            }
          } else {
            // Otherwise try to create a date from whatever we have
            birthdateObj = new Date(values.birthdate as any);
          }
          
          // Validate that we have a valid date
          if (isNaN(birthdateObj.getTime())) {
            throw new Error("Invalid date");
          }
          
          formattedBirthdate = format(birthdateObj, "yyyy-MM-dd");
          console.log("Formatted birthdate:", formattedBirthdate);
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
      
      // Data for insertion
      const customerData = {
        name: values.name,
        tax_id: values.taxId || null,
        email: values.email || null,
        phone: values.phone || null,
        birthdate: formattedBirthdate,
        address: values.address || null,
        notes: values.notes || null,
      };
      
      console.log("Inserting customer data:", customerData);
      
      const { error, data } = await supabase
        .from("customers")
        .insert(customerData)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        
        // Handle specific Supabase errors
        if (error.code === '42501') {
          // This is a row-level security policy violation
          toast({
            variant: "destructive",
            title: "Erro de permissão",
            description: "Não foi possível adicionar o cliente devido a restrições de permissão. Entre em contato com o administrador."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: `Não foi possível criar o cliente: ${error.message}`
          });
        }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    onSubmit,
    isSubmitting
  };
};
