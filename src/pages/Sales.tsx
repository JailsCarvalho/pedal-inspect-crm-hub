
import React, { useState } from "react";
import SalesList from "@/components/sales/SalesList";
import { Button } from "@/components/ui/button";
import NewSaleDialog from "@/components/sales/NewSaleDialog";
import { NewInspectionDialog } from "@/components/inspections/NewInspectionDialog";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Sales = () => {
  const [openNewSaleDialog, setOpenNewSaleDialog] = useState(false);
  const [openNewInspectionDialog, setOpenNewInspectionDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; open: boolean }>({
    url: "",
    open: false,
  });

  const handleSaleCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleInspectionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleViewInvoice = (invoiceFile: string) => {
    setPdfPreview({ url: invoiceFile, open: true });
  };

  const handleClosePreview = () => {
    setPdfPreview({ ...pdfPreview, open: false });
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

      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreview.open} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Visualização da Fatura</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            <iframe 
              src={pdfPreview.url} 
              className="w-full h-full border-0"
              title="Visualização de Fatura"
              allow="fullscreen"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
