
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer, Inspection } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Mail, PhoneCall, Bike, Gift, MessageSquare, Pencil } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EditClientDrawer } from "./EditClientDrawer";
import { ClientInfoCard } from "./ClientInfoCard";
import { InspectionsList } from "./ClientInspectionsList";
import { useBirthdayInfo } from "@/hooks/useBirthdayInfo";

interface ClientDetailProps {
  clientId?: string;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ clientId }) => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Customer | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { toast } = useToast();
  
  // Use the custom hook for birthday information
  const { isBirthday, nextBirthdayDate, recalculateBirthdayInfo } = useBirthdayInfo(client);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError) throw clientError;

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
      
      // Fetch client's inspections
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from("inspections")
        .select(`
          id, 
          date, 
          next_inspection_date, 
          status, 
          notes,
          inspection_value,
          customer_id,
          bike_id,
          bikes(model, serial_number)
        `)
        .eq("customer_id", clientId);
      
      if (inspectionsError) throw inspectionsError;
      
      // Transform to match Inspection type
      const transformedInspections: Inspection[] = inspectionsData.map(item => ({
        id: item.id,
        customerId: item.customer_id,
        customerName: customer.name,
        bikeModel: item.bikes?.model || "Unknown",
        bikeSerialNumber: item.bikes?.serial_number || "",
        date: item.date,
        nextInspectionDate: item.next_inspection_date,
        status: item.status as "scheduled" | "completed" | "pending" | "cancelled",
        notes: item.notes || "",
        inspectionValue: item.inspection_value
      }));
      
      setInspections(transformedInspections);
    } catch (error) {
      console.error("Error fetching client details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientUpdated = () => {
    // Refetch client data after update
    if (clientId) {
      setIsLoading(true);
      // Fix: Remove the Promise chain and handle everything properly without catch
      const fetchUpdatedClient = async () => {
        try {
          const { data, error } = await supabase
            .from("customers")
            .select("*")
            .eq("id", clientId)
            .single();
          
          if (error) {
            console.error("Error updating client data:", error);
            setIsLoading(false);
            return;
          }
          
          const updatedCustomer: Customer = {
            id: data.id,
            name: data.name,
            email: data.email || "",
            phone: data.phone || "",
            birthdate: data.birthdate || "",
            address: data.address || "",
            createdAt: data.created_at
          };
          
          setClient(updatedCustomer);
          recalculateBirthdayInfo(updatedCustomer);
        } catch (error) {
          console.error("Error updating client data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUpdatedClient();
    }
  };

  const handleSendBirthdayMessage = () => {
    if (!client?.phone) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Telefone do cliente não encontrado.",
        variant: "destructive"
      });
      return;
    }

    // Format the phone number (remove any non-digit characters)
    const formattedPhone = client.phone.replace(/\D/g, "");
    
    // Create the birthday message
    const message = `Olá ${client.name}! A equipe da Ambikes deseja um Feliz Aniversário! 🎂🎉 Como presente especial, oferecemos 10% de desconto na próxima inspeção da sua bicicleta. Esperamos vê-lo(a) em breve!`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "WhatsApp aberto",
      description: "Mensagem de aniversário preparada para envio."
    });
  };

  if (isLoading) {
    return <ClientDetailSkeleton />;
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Cliente não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate("/clients")}>
          Voltar para a lista de clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/clients")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Detalhes do Cliente</h2>
      </div>

      <ClientInfoCard 
        client={client}
        isBirthday={isBirthday}
        nextBirthdayDate={nextBirthdayDate}
        onSendBirthdayMessage={handleSendBirthdayMessage}
        onEdit={() => setIsEditDrawerOpen(true)}
      />

      <h3 className="text-xl font-bold">Inspeções</h3>
      
      <InspectionsList inspections={inspections} />
      
      <EditClientDrawer
        client={client}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
};

const ClientDetailSkeleton = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <p>Carregando detalhes do cliente...</p>
    </div>
  );
};

export default ClientDetail;
