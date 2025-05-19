
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Inspection } from "@/types";
import { Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditInspectionFormProps {
  inspection: Inspection;
  onSubmit: (data: Partial<Inspection>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const EditInspectionForm = ({
  inspection,
  onSubmit,
  isSubmitting,
  onCancel,
}: EditInspectionFormProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      status: inspection.status,
      notes: inspection.notes || "",
      inspectionValue: inspection.inspectionValue?.toString() || "0",
      laborCost: inspection.laborCost?.toString() || "0",
      invoiceFile: inspection.invoiceFile || "",
    },
  });

  const handleSubmit = (data: any) => {
    try {
      onSubmit({
        status: data.status,
        notes: data.notes,
        inspectionValue: parseFloat(data.inspectionValue) || 0,
        laborCost: parseFloat(data.laborCost) || 0,
        invoiceFile: selectedFile ? selectedFile.name : data.invoiceFile,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar a inspeção.",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue('invoiceFile', file.name);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inspectionValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Inspeção (€)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="laborCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Mão de Obra (€)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="invoiceFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fatura</FormLabel>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  id="invoiceFile" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <FormControl>
                  <Input 
                    value={field.value || ""}
                    placeholder="Nenhum arquivo selecionado"
                    readOnly
                  />
                </FormControl>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('invoiceFile')?.click()}
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
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre a inspeção..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditInspectionForm;
