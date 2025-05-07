
import React, { useState } from "react";
import SalesList from "@/components/sales/SalesList";
import { Button } from "@/components/ui/button";
import NewSaleDialog from "@/components/sales/NewSaleDialog";
import { NewInspectionDialog } from "@/components/inspections/NewInspectionDialog";
import { PlusCircle } from "lucide-react";

const Sales = () => {
  const [openNewSaleDialog, setOpenNewSaleDialog] = useState(false);
  const [openNewInspectionDialog, setOpenNewInspectionDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaleCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleInspectionCreated = () => {
    setRefreshKey((prev) => prev + 1);
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
        <SalesList key={refreshKey} />
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
