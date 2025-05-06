
import React from "react";
import ClientsList from "@/components/clients/ClientsList";
import { mockCustomers } from "@/data/mockData";

const Clients = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
      </div>
      
      <div className="border-t">
        <ClientsList customers={mockCustomers} />
      </div>
    </div>
  );
};

export default Clients;
