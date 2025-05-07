
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types";
import { addDays, format } from "date-fns";

// Schema para validação do formulário
const saleFormSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  productName: z.string().min(1, "Nome do produto é obrigatório"),
  bikeModel: z.string().optional(),
  bikeSerialNumber: z.string().optional(),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleCreated: () => void;
}

const NewSaleDialog = ({ open, onOpenChange, onSaleCreated }: NewSaleDialogProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: "",
      productName: "",
      bikeModel: "",
      bikeSerialNumber: "",
      price: undefined,
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  // Busca a lista de clientes
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, email, phone, birthdate, address, created_at")
          .order("name");

        if (error) throw error;

        const formattedCustomers = data.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          birthdate: customer.birthdate || "",
          address: customer.address || "",
          createdAt: customer.created_at
        }));

        setCustomers(formattedCustomers);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a lista de clientes."
        });
      }
    };

    if (open) {
      fetchCustomers();
    }
  }, [open, toast]);

  const onSubmit = async (data: SaleFormValues) => {
    try {
      setIsLoading(true);

      // 1. Primeiro, registra a venda
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          customer_id: data.customerId,
          product_name: data.productName,
          bike_model: data.bikeModel || null,
          bike_serial_number: data.bikeSerialNumber || null,
          price: data.price,
          date: data.date,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Se tiver modelo de bike, cria ou atualiza o registro da bike
      if (data.bikeModel) {
        // Verifica se já existe uma bike com esse número de série para esse cliente
        const { data: existingBike } = await supabase
          .from("bikes")
          .select("id")
          .eq("customer_id", data.customerId)
          .eq("serial_number", data.bikeSerialNumber || "")
          .maybeSingle();

        if (!existingBike) {
          // Se não existir, cria uma nova bike
          const { error: bikeError } = await supabase
            .from("bikes")
            .insert({
              customer_id: data.customerId,
              model: data.bikeModel,
              serial_number: data.bikeSerialNumber || null,
            });

          if (bikeError) throw bikeError;
        }

        // 3. Agenda uma inspeção para daqui a 360 dias
        const nextInspectionDate = addDays(new Date(data.date), 360);
        
        const { error: inspectionError } = await supabase
          .from("inspections")
          .insert({
            customer_id: data.customerId,
            bike_id: existingBike?.id || null, // Se não existir uma bike, deixa como null
            date: format(new Date(), "yyyy-MM-dd"),
            next_inspection_date: format(nextInspectionDate, "yyyy-MM-dd"),
            status: "scheduled",
            notes: `Inspeção agendada automaticamente para ${format(nextInspectionDate, "dd/MM/yyyy")} após compra da bike.`,
          });

        if (inspectionError) throw inspectionError;
      }

      // 4. Cria uma notificação sobre a nova venda
      await supabase
        .from("notifications")
        .insert({
          title: "Nova venda registrada",
          message: `Uma nova venda foi registrada para o produto ${data.productName}.`,
          type: "system",
          customer_id: data.customerId,
          read: false,
        });

      form.reset();
      onOpenChange(false);
      onSaleCreated();

    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a venda."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Bicicleta Specialized Rockhopper"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bikeModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo da Bike (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Rockhopper Expert"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bikeSerialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Série (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: SP12345678"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a venda"
                      className="resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar Venda"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleDialog;
