
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SalesList from "@/components/sales/SalesList";
import NewSaleDialog from "@/components/sales/NewSaleDialog";
import { NewInspectionDialog } from "@/components/inspections/NewInspectionDialog";

const Sales = () => {
  const [openNewSaleDialog, setOpenNewSaleDialog] = useState(false);
  const [openInspectionDialog, setOpenInspectionDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const [saleData, setSaleData] = useState<any>(null);

  const handleSaleCreated = async (data: any) => {
    toast({
      title: "Venda registrada",
      description: "A venda foi registrada com sucesso."
    });

    // Se tiver modelo de bike, verifica se a inspeção foi criada
    if (data.bikeModel) {
      try {
        // Consulta se existe uma inspeção agendada para o cliente com data futura
        const { data: inspections, error } = await supabase
          .from("inspections")
          .select("*")
          .eq("customer_id", data.customerId)
          .gt("next_inspection_date", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          throw error;
        }

        // Se não houver inspeção agendada, abrimos o modal para criar uma
        if (!inspections || inspections.length === 0) {
          setSaleData(data);
          // Abre o diálogo de inspeção automaticamente
          setTimeout(() => {
            setOpenInspectionDialog(true);
          }, 500);
        } else {
          toast({
            title: "Inspeção agendada",
            description: "Uma inspeção já foi agendada para esta bicicleta."
          });
        }
      } catch (error) {
        console.error("Erro ao verificar inspeções:", error);
      }
    }
    
    setRefreshKey(prev => prev + 1);
  };

  // Fix the function signature to match what NewInspectionDialog expects
  const handleInspectionCreated = () => {
    toast({
      title: "Inspeção agendada",
      description: "Uma inspeção foi agendada para daqui a 360 dias."
    });
    setSaleData(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <Button 
          onClick={() => setOpenNewSaleDialog(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>
      
      <div className="border-t">
        <SalesList key={refreshKey} />
      </div>

      <NewSaleDialog 
        open={openNewSaleDialog} 
        onOpenChange={setOpenNewSaleDialog} 
        onSaleCreated={handleSaleCreated}
      />

      {saleData && (
        <NewInspectionDialog
          open={openInspectionDialog}
          onOpenChange={setOpenInspectionDialog}
          onInspectionCreated={handleInspectionCreated}
          initialCustomerId={saleData.customerId}
          initialBikeModel={saleData.bikeModel}
          initialBikeSerialNumber={saleData.bikeSerialNumber}
          initialDate={new Date()}
          initialNextInspectionDate={new Date(Date.now() + 360 * 24 * 60 * 60 * 1000)}
        />
      )}
    </div>
  );
};

export default Sales;
