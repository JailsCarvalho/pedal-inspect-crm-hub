
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types";

// Schema para validação do formulário
const saleFormSchema = z.object({
  customerId: z.string().optional(),
  productName: z.string().min(1, "Nome do produto é obrigatório"),
  bikeModel: z.string().optional(),
  bikeSerialNumber: z.string().optional(),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  invoiceFile: z.string().optional(),
  notes: z.string().optional(),
});

// Schema para validação de novo cliente
const newCustomerSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório e deve ter pelo menos 3 caracteres"),
  taxId: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthdate: z.date().optional().nullable(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;
type NewCustomerValues = z.infer<typeof newCustomerSchema>;

type CombinedFormValues = SaleFormValues & {
  newCustomer?: NewCustomerValues;
};

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleCreated: () => void;
}

const NewSaleDialog = ({ open, onOpenChange, onSaleCreated }: NewSaleDialogProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const { toast } = useToast();

  const saleForm = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: "",
      productName: "",
      bikeModel: "",
      bikeSerialNumber: "",
      price: undefined,
      date: format(new Date(), "yyyy-MM-dd"),
      invoiceFile: "",
      notes: "",
    },
  });

  const newCustomerForm = useForm<NewCustomerValues>({
    resolver: zodResolver(newCustomerSchema),
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

  // Busca a lista de clientes
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, email, phone, birthdate, address, created_at, tax_id, notes");

        if (error) throw error;

        if (data) {
          const formattedCustomers = data.map(customer => ({
            id: customer.id,
            name: customer.name,
            taxId: customer.tax_id || "",
            email: customer.email || "",
            phone: customer.phone || "",
            birthdate: customer.birthdate || "",
            address: customer.address || "",
            notes: customer.notes || "",
            createdAt: customer.created_at
          }));
  
          setCustomers(formattedCustomers);
        }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real application, we would upload the file to storage
      // For now, we'll just set the filename in the form
      saleForm.setValue('invoiceFile', e.target.files[0].name);
    }
  };

  const onSubmit = async (data: CombinedFormValues) => {
    try {
      setIsLoading(true);

      let customerId = data.customerId;

      // Se estiver criando um novo cliente
      if (activeTab === "new" && data.newCustomer) {
        // 1. Criar o novo cliente
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: data.newCustomer.name,
            tax_id: data.newCustomer.taxId || null,
            email: data.newCustomer.email || null,
            phone: data.newCustomer.phone || null,
            birthdate: data.newCustomer.birthdate ? format(data.newCustomer.birthdate, "yyyy-MM-dd") : null,
            address: data.newCustomer.address || null,
            notes: data.newCustomer.notes || null,
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = customerData.id;
      }

      if (!customerId) {
        throw new Error("Cliente é obrigatório");
      }

      // Important: First create or ensure the bike record exists BEFORE creating the sale
      if (data.bikeModel) {
        // Check if bike exists first
        const { data: existingBike } = await supabase
          .from("bikes")
          .select("id")
          .eq("customer_id", customerId)
          .eq("model", data.bikeModel)
          .eq("serial_number", data.bikeSerialNumber || null)
          .maybeSingle();

        // If bike doesn't exist, create it
        if (!existingBike) {
          const { error: bikeError } = await supabase
            .from("bikes")
            .insert({
              customer_id: customerId,
              model: data.bikeModel,
              serial_number: data.bikeSerialNumber || null,
            });

          if (bikeError) throw bikeError;
        }
      }

      // 2. Now register the sale after ensuring bike exists
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          customer_id: customerId,
          product_name: data.productName,
          bike_model: data.bikeModel || null,
          bike_serial_number: data.bikeSerialNumber || null,
          price: data.price,
          date: data.date,
          invoice_file: data.invoiceFile || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 3. Create a notification about the new sale
      await supabase
        .from("notifications")
        .insert({
          title: "Nova venda registrada",
          message: `Uma nova venda foi registrada para o produto ${data.productName}.`,
          type: "system",
          customer_id: customerId,
          read: false,
        });

      saleForm.reset();
      newCustomerForm.reset();
      setActiveTab("existing");
      onOpenChange(false);
      onSaleCreated();

      // Log success for debugging
      console.log("Sale registered successfully with bike information");

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "existing") {
      const isValid = await saleForm.trigger();
      if (isValid) {
        const saleData = saleForm.getValues();
        onSubmit(saleData);
      }
    } else {
      const isSaleValid = await saleForm.trigger(["productName", "bikeModel", "bikeSerialNumber", "price", "date", "invoiceFile", "notes"]);
      const isCustomerValid = await newCustomerForm.trigger();
      
      if (isSaleValid && isCustomerValid) {
        const saleData = saleForm.getValues();
        const customerData = newCustomerForm.getValues();
        onSubmit({ ...saleData, customerId: undefined, newCustomer: customerData });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "existing" | "new")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Cliente Existente</TabsTrigger>
            <TabsTrigger value="new">Novo Cliente</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
            <TabsContent value="existing">
              <Form {...saleForm}>
                <FormField
                  control={saleForm.control}
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
                              {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </TabsContent>
            
            <TabsContent value="new">
              <Form {...newCustomerForm}>
                <div className="space-y-4">
                  <FormField
                    control={newCustomerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={newCustomerForm.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contribuinte</FormLabel>
                          <FormControl>
                            <Input placeholder="NIF" {...field} disabled={isLoading} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newCustomerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} disabled={isLoading} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={newCustomerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@exemplo.com" {...field} disabled={isLoading} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newCustomerForm.control}
                      name="birthdate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Nascimento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecionar data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={ptBR}
                                captionLayout="dropdown-buttons"
                                fromYear={1920}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={newCustomerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Endereço completo" {...field} disabled={isLoading} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={newCustomerForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nota</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Observações sobre o cliente" {...field} disabled={isLoading} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </TabsContent>
            
            {/* Campos comuns para ambas as abas */}
            <div className="pt-4 border-t">
              <Form {...saleForm}>
                <div className="space-y-4">
                  <FormField
                    control={saleForm.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto*</FormLabel>
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
                      control={saleForm.control}
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
                      control={saleForm.control}
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
                      control={saleForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor*</FormLabel>
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
                      control={saleForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data*</FormLabel>
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
                    control={saleForm.control}
                    name="invoiceFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fatura</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            id="invoiceFileUpload" 
                            className="hidden" 
                            onChange={handleFileChange}
                          />
                          <FormControl>
                            <Input 
                              value={field.value || ""}
                              placeholder="Nenhuma fatura anexada"
                              readOnly
                            />
                          </FormControl>
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('invoiceFileUpload')?.click()}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Anexar
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={saleForm.control}
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
                </div>
              </Form>
            </div>
            
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleDialog;
