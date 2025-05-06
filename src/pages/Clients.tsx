
import React, { useState } from "react";
import ClientsList from "@/components/clients/ClientsList";
import { Button } from "@/components/ui/button";
import { NewClientDialog } from "@/components/clients/NewClientDialog";
import { PlusCircle } from "lucide-react";

const Clients = () => {
  const [openNewClientDialog, setOpenNewClientDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClientCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Button 
          onClick={() => setOpenNewClientDialog(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <div className="border-t">
        <ClientsList key={refreshKey} />
      </div>

      <NewClientDialog 
        open={openNewClientDialog} 
        onOpenChange={setOpenNewClientDialog} 
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default Clients;
