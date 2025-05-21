
import React, { useState } from "react";
import InspectionDetailComponent from "@/components/inspections/InspectionDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const InspectionDetail = () => {
  const [pdfPreview, setPdfPreview] = useState<{ url: string; open: boolean }>({
    url: "",
    open: false,
  });

  const handleViewInvoice = (invoiceFile: string) => {
    setPdfPreview({ url: invoiceFile, open: true });
  };

  const handleClosePreview = () => {
    setPdfPreview({ ...pdfPreview, open: false });
  };

  return (
    <>
      <InspectionDetailComponent onViewInvoice={handleViewInvoice} />
      
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
    </>
  );
};

export default InspectionDetail;
