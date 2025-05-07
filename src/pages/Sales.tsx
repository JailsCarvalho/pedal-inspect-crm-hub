
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SalesList from "@/components/sales/SalesList";
import NewSaleDialog from "@/components/sales/NewSaleDialog";

const Sales = () => {
  const [openNewSaleDialog, setOpenNewSaleDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleSaleCreated = () => {
    toast({
      title: "Venda registrada",
      description: "A venda foi registrada com sucesso e uma inspeção foi agendada para daqui a 360 dias."
    });
    setRefreshKey(prev => prev + 1);
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
    </div>
  );
};

export default Sales;
