
import React, { useState } from "react";
import SalesList from "@/components/sales/SalesList";
import { Button } from "@/components/ui/button";
import NewSaleDialog from "@/components/sales/NewSaleDialog";
import { NewInspectionDialog } from "@/components/inspections/NewInspectionDialog";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Sales = () => {
  const [openNewSaleDialog, setOpenNewSaleDialog] = useState(false);
  const [openNewInspectionDialog, setOpenNewInspectionDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleSaleCreated = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Venda criada",
      description: "A venda foi registrada com sucesso.",
    });
  };

  const handleInspectionCreated = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Inspeção criada",
      description: "A inspeção foi registrada com sucesso.",
    });
  };

  // This function isn't needed anymore since we're opening the invoice in a new tab directly
  const handleViewInvoice = (invoiceFile: string) => {
    if (!invoiceFile) {
      toast({
        title: "Fatura não disponível",
        description: "Esta venda não possui uma fatura associada.",
        variant: "default",
      });
      return;
    }
    
    window.open(invoiceFile, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setOpenNewInspectionDialog(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Inspeção
          </Button>
          <Button 
            onClick={() => setOpenNewSaleDialog(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>
      
      <div className="border-t">
        <SalesList key={refreshKey} onViewInvoice={handleViewInvoice} />
      </div>

      <NewSaleDialog 
        open={openNewSaleDialog} 
        onOpenChange={setOpenNewSaleDialog} 
        onSaleCreated={handleSaleCreated}
      />

      <NewInspectionDialog
        open={openNewInspectionDialog}
        onOpenChange={setOpenNewInspectionDialog}
        onInspectionCreated={handleInspectionCreated}
      />
    </div>
  );
};

export default Sales;
