
import React, { useState } from "react";
import SaleDetailComponent from "@/components/sales/SaleDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SaleDetail = () => {
  const [pdfPreview, setPdfPreview] = useState<{ url: string; open: boolean }>({
    url: "",
    open: false,
  });

  const handleViewInvoice = (invoiceFile: string) => {
    // Open directly in a new tab
    window.open(invoiceFile, '_blank');
  };

  const handleClosePreview = () => {
    setPdfPreview({ ...pdfPreview, open: false });
  };

  return (
    <SaleDetailComponent onViewInvoice={handleViewInvoice} />
  );
};

export default SaleDetail;
