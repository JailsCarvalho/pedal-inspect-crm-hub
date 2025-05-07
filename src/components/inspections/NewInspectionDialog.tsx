import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Bike } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const formSchema = z.object({
  customerId: z.string().uuid({ message: "Cliente é obrigatório" }),
  bikeModel: z.string().min(2, { message: "Modelo da bicicleta é obrigatório" }),
  bikeSerialNumber: z.string().optional(),
  date: z.date(),
  nextInspectionDate: z.date(),
  status: z.enum(["scheduled", "completed", "pending", "cancelled"]),
  notes: z.string().optional(),
});

interface NewInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInspectionCreated?: () => void;
  initialCustomerId?: string;
  initialBikeModel?: string;
  initialBikeSerialNumber?: string;
  initialDate?: Date;
  initialNextInspectionDate?: Date;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export const NewInspectionDialog: React.FC<NewInspectionDialogProps> = ({
  open,
  onOpenChange,
  onInspectionCreated,
  initialCustomerId,
  initialBikeModel,
  initialBikeSerialNumber,
  initialDate,
  initialNextInspectionDate,
}) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [existingBikes, setExistingBikes] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(initialCustomerId || null);
  const [useExistingBike, setUseExistingBike] = useState(false);
  const [selectedBike, setSelectedBike] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: initialCustomerId || "",
      bikeModel: initialBikeModel || "",
      bikeSerialNumber: initialBikeSerialNumber || "",
      date: initialDate || new Date(),
      nextInspectionDate: initialNextInspectionDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "scheduled" as const,
      notes: "",
    },
  });

  // Atualizar form values quando valores iniciais mudarem
  useEffect(() => {
    if (initialCustomerId) {
      form.setValue("customerId", initialCustomerId);
      setSelectedCustomer(initialCustomerId);
    }
    if (initialBikeModel) form.setValue("bikeModel", initialBikeModel);
    if (initialBikeSerialNumber) form.setValue("bikeSerialNumber", initialBikeSerialNumber);
    if (initialDate) form.setValue("date", initialDate);
    if (initialNextInspectionDate) form.setValue("nextInspectionDate", initialNextInspectionDate);
  }, [initialCustomerId, initialBikeModel, initialBikeSerialNumber, initialDate, initialNextInspectionDate, form]);

  const isSubmitting = form.formState.isSubmitting;

  // Load customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, email")
          .order("name");

        if (error) {
          throw error;
        }

        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a lista de clientes.",
        });
      }
    };

    fetchCustomers();
  }, [toast]);

  // Load customer bikes when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const fetchBikes = async () => {
        try {
          const { data, error } = await supabase
            .from("bikes")
            .select("id, model, serial_number")
            .eq("customer_id", selectedCustomer);

          if (error) {
            throw error;
          }

          setExistingBikes(data || []);
        } catch (error) {
          console.error("Error fetching bikes:", error);
        }
      };

      fetchBikes();
    }
  }, [selectedCustomer]);

  // Handle customer change
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    form.setValue("customerId", customerId);
  };

  // Handle bike change
  const handleBikeChange = (bikeId: string) => {
    setSelectedBike(bikeId);
    const bike = existingBikes.find(bike => bike.id === bikeId);
    if (bike) {
      form.setValue("bikeModel", bike.model);
      form.setValue("bikeSerialNumber", bike.serial_number || "");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // First, get or create a bike
      let bikeId;
      
      if (useExistingBike && selectedBike) {
        bikeId = selectedBike;
      } else {
        // Create a new bike
        const { data: bikeData, error: bikeError } = await supabase
          .from("bikes")
          .insert({
            customer_id: values.customerId,
            model: values.bikeModel,
            serial_number: values.bikeSerialNumber || null,
          })
          .select('id')
          .single();

        if (bikeError) {
          throw bikeError;
        }

        bikeId = bikeData.id;
      }

      // Now create the inspection
      const { error: inspectionError } = await supabase
        .from("inspections")
        .insert({
          bike_id: bikeId,
          customer_id: values.customerId,
          date: format(values.date, "yyyy-MM-dd'T'HH:mm:ss"),
          next_inspection_date: format(values.nextInspectionDate, "yyyy-MM-dd'T'HH:mm:ss"),
          status: values.status,
          notes: values.notes || null,
        });

      if (inspectionError) {
        throw inspectionError;
      }

      toast({
        title: "Inspeção criada",
        description: "Inspeção foi adicionada com sucesso",
      });
      
      form.reset();
      onOpenChange(false);
      if (onInspectionCreated) {
        onInspectionCreated();
      }
    } catch (error) {
      console.error("Error creating inspection:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a inspeção. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Inspeção</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer Selection */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente*</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={(value) => handleCustomerChange(value)} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} {customer.email ? `(${customer.email})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bike Selection - Only show if customer is selected */}
            {selectedCustomer && existingBikes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-existing-bike"
                    checked={useExistingBike}
                    onChange={(e) => setUseExistingBike(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="use-existing-bike" className="text-sm">
                    Usar bicicleta existente
                  </label>
                </div>
                
                {useExistingBike && (
                  <FormItem>
                    <FormLabel>Bicicleta</FormLabel>
                    <Select onValueChange={handleBikeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar bicicleta" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingBikes.map((bike) => (
                          <SelectItem key={bike.id} value={bike.id}>
                            {bike.model} {bike.serial_number ? `(SN: ${bike.serial_number})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              </div>
            )}

            {/* Bike Details - Show if not using existing bike */}
            {(!useExistingBike || existingBikes.length === 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bikeModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo da Bicicleta*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mountain Bike XTR" {...field} />
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
                      <FormLabel>Número de Série</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: MB12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Inspection Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Inspeção*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal")}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecionar data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextInspectionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Próxima Inspeção*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal")}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecionar data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status*</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Agendada</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações sobre a inspeção" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Agendar Inspeção"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
