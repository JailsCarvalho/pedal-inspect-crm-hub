
import React from "react";
import SaleDetailComponent from "@/components/sales/SaleDetail";

const SaleDetail = () => {
  const handleViewInvoice = (invoiceFile: string) => {
    // Open directly in a new tab
    window.open(invoiceFile, '_blank');
  };

  return (
    <SaleDetailComponent onViewInvoice={handleViewInvoice} />
  );
};

export default SaleDetail;
