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

interface ClientDetailProps {
  clientId?: string;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ clientId }) => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Customer | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBirthday, setIsBirthday] = useState(false);
  const [nextBirthdayDate, setNextBirthdayDate] = useState<string | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
        
        // Check if today is the client's birthday or close to it
        if (customer.birthdate) {
          const today = new Date();
          
          try {
            // Create Date object from the birthdate string
            const birthdate = new Date(customer.birthdate);
            
            if (!isNaN(birthdate.getTime())) {
              // Get current year's birthday
              const currentYearBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
              
              // Get next year's birthday (for when this year's birthday has already passed)
              const nextYearBirthday = new Date(today.getFullYear() + 1, birthdate.getMonth(), birthdate.getDate());
              
              // Determine if today is the birthday
              if (
                today.getDate() === currentYearBirthday.getDate() && 
                today.getMonth() === currentYearBirthday.getMonth()
              ) {
                setIsBirthday(true);
                setNextBirthdayDate("hoje");
              } 
              // Calculate days until next birthday
              else {
                // Use the appropriate reference date (this year or next year)
                const referenceDate = today > currentYearBirthday ? nextYearBirthday : currentYearBirthday;
                const daysUntilBirthday = differenceInDays(referenceDate, today);
                
                if (daysUntilBirthday <= 7) {
                  setNextBirthdayDate(`em ${daysUntilBirthday} ${daysUntilBirthday === 1 ? 'dia' : 'dias'}`);
                } else if (daysUntilBirthday <= 30) {
                  setNextBirthdayDate(`em ${daysUntilBirthday} dias`);
                }
              }
            }
          } catch (error) {
            console.error("Error calculating birthday:", error);
          }
        }
        
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

    fetchClientData();
  }, [clientId]);

  const handleClientUpdated = () => {
    // Refetch client data after update
    if (clientId) {
      setIsLoading(true);
      supabase
        .from("customers")
        .select("*")
        .eq("id", clientId)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          
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
          
          // Recalculate birthday info
          if (updatedCustomer.birthdate) {
            const today = new Date();
            try {
              const birthdate = new Date(updatedCustomer.birthdate);
              
              if (!isNaN(birthdate.getTime())) {
                const currentYearBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
                const nextYearBirthday = new Date(today.getFullYear() + 1, birthdate.getMonth(), birthdate.getDate());
                
                if (
                  today.getDate() === currentYearBirthday.getDate() && 
                  today.getMonth() === currentYearBirthday.getMonth()
                ) {
                  setIsBirthday(true);
                  setNextBirthdayDate("hoje");
                } else {
                  const referenceDate = today > currentYearBirthday ? nextYearBirthday : currentYearBirthday;
                  const daysUntilBirthday = differenceInDays(referenceDate, today);
                  
                  if (daysUntilBirthday <= 7) {
                    setNextBirthdayDate(`em ${daysUntilBirthday} ${daysUntilBirthday === 1 ? 'dia' : 'dias'}`);
                  } else if (daysUntilBirthday <= 30) {
                    setNextBirthdayDate(`em ${daysUntilBirthday} dias`);
                  } else {
                    setNextBirthdayDate(null);
                  }
                }
              } else {
                setIsBirthday(false);
                setNextBirthdayDate(null);
              }
            } catch (error) {
              console.error("Error recalculating birthday:", error);
              setIsBirthday(false);
              setNextBirthdayDate(null);
            }
          } else {
            setIsBirthday(false);
            setNextBirthdayDate(null);
          }
        })
        .catch((error) => {
          console.error("Error updating client data:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Concluída</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Agendada</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pendente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando detalhes do cliente...</p>
      </div>
    );
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {client.name}
              {isBirthday && (
                <Badge className="ml-2 bg-pink-100 text-pink-800 hover:bg-pink-200">
                  <Gift className="h-3 w-3 mr-1" /> Aniversário hoje!
                </Badge>
              )}
              {nextBirthdayDate && !isBirthday && (
                <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
                  <Gift className="h-3 w-3 mr-1" /> Aniversário {nextBirthdayDate}
                </Badge>
              )}
            </CardTitle>
            <div className="space-x-2">
              {client.phone && (
                <Button 
                  onClick={handleSendBirthdayMessage}
                  className="bg-green-600 hover:bg-green-700 flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> 
                  Enviar Mensagem de Aniversário
                </Button>
              )}
              <Button
                onClick={() => setIsEditDrawerOpen(true)}
                variant="outline"
                className="flex items-center"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-center">
                  <PhoneCall className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              
              {client.birthdate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Aniversário: {formatDate(client.birthdate)}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Cliente desde: {formatDate(client.createdAt)}</span>
              </div>
            </div>
            
            {client.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Endereço</p>
                <p>{client.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <h3 className="text-xl font-bold">Inspeções</h3>
      
      {inspections.length > 0 ? (
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <Card key={inspection.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Bike className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{inspection.bikeModel}</span>
                    {inspection.bikeSerialNumber && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        SN: {inspection.bikeSerialNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(inspection.status)}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/inspections/${inspection.id}`)}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Data</p>
                    <p>{formatDate(inspection.date)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Próxima inspeção</p>
                    <p>{formatDate(inspection.nextInspectionDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor</p>
                    <p>{inspection.inspectionValue ? `R$ ${inspection.inspectionValue.toFixed(2)}` : "-"}</p>
                  </div>
                </div>
                
                {inspection.notes && (
                  <div className="mt-2">
                    <p className="text-muted-foreground text-sm">Observações</p>
                    <p className="text-sm">{inspection.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex justify-center py-6">
            <p>Nenhuma inspeção encontrada para este cliente.</p>
          </CardContent>
        </Card>
      )}
      
      <EditClientDrawer
        client={client}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
};

export default ClientDetail;
