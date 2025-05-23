
import React from "react";
import SaleDetailComponent from "@/components/sales/SaleDetail";

const SaleDetail = () => {
  const handleViewInvoice = (invoiceFile: string) => {
    // Simply open the PDF in a new tab without any popup
    window.open(invoiceFile, '_blank', 'noopener,noreferrer');
  };

  return (
    <SaleDetailComponent onViewInvoice={handleViewInvoice} />
  );
};

export default SaleDetail;
