
import React from "react";
import ClientDetailComponent from "@/components/clients/ClientDetail";
import { Edit } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Customer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { EditClientDrawer } from "@/components/clients/EditClientDrawer";
import { Button } from "@/components/ui/button";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  const fetchClient = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data: clientData, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Transform to match Customer type
      const customer: Customer = {
        id: clientData.id,
        name: clientData.name,
        email: clientData.email || "",
        phone: clientData.phone || "",
        birthdate: clientData.birthdate || "",
        address: clientData.address || "",
        createdAt: clientData.created_at
      };
      
      setClient(customer);
    } catch (error) {
      console.error("Error fetching client details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClient();
  }, [id]);
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Detalhes do Cliente</h2>
        {!isLoading && client && (
          <Button 
            onClick={() => setIsEditDrawerOpen(true)}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Edit className="h-4 w-4" />
            Editar Cliente
          </Button>
        )}
      </div>
      
      <ClientDetailComponent />
      
      {client && (
        <EditClientDrawer
          client={client}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          onClientUpdated={fetchClient}
        />
      )}
    </>
  );
};

export default ClientDetail;
