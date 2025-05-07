
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Inspection } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Bike, Wrench, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const InspectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInspectionData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("inspections")
          .select(`
            id, 
            date, 
            next_inspection_date, 
            status, 
            notes,
            inspection_value,
            customer_id,
            customers(name),
            bike_id,
            bikes(model, serial_number)
          `)
          .eq("id", id)
          .single();
        
        if (error) throw error;
        
        // Transform to match Inspection type
        const transformedInspection: Inspection = {
          id: data.id,
          customerId: data.customer_id,
          customerName: data.customers?.name || "Unknown",
          bikeModel: data.bikes?.model || "Unknown",
          bikeSerialNumber: data.bikes?.serial_number || "",
          date: data.date,
          nextInspectionDate: data.next_inspection_date,
          status: data.status as "scheduled" | "completed" | "pending" | "cancelled",
          notes: data.notes || "",
          inspectionValue: data.inspection_value
        };
        
        setInspection(transformedInspection);
      } catch (error) {
        console.error("Error fetching inspection details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInspectionData();
    }
  }, [id]);

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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><Wrench className="h-3 w-3 mr-1" /> Concluída</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Calendar className="h-3 w-3 mr-1" /> Agendada</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200"><Calendar className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><ArrowLeft className="h-3 w-3 mr-1" /> Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando detalhes da inspeção...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Inspeção não encontrada.</p>
        <Button className="mt-4" onClick={() => navigate("/inspections")}>
          Voltar para a lista de inspeções
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/inspections")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Detalhes da Inspeção</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inspeção #{id?.substring(0, 8)}</CardTitle>
          {getStatusBadge(inspection.status)}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Cliente</h3>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => navigate(`/clients/${inspection.customerId}`)}
                  >
                    {inspection.customerName}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Bicicleta</h3>
                <div className="flex items-center mt-1">
                  <Bike className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{inspection.bikeModel}</span>
                </div>
                {inspection.bikeSerialNumber && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    SN: {inspection.bikeSerialNumber}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Datas</h3>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Data da inspeção</p>
                    <p>{formatDate(inspection.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima inspeção</p>
                    <p>{formatDate(inspection.nextInspectionDate)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Valor</h3>
                <div className="flex items-center mt-1">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">
                    {inspection.inspectionValue 
                      ? `R$ ${inspection.inspectionValue.toFixed(2)}` 
                      : "Valor não registrado"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {inspection.notes && (
            <div>
              <h3 className="text-lg font-medium mb-2">Observações</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p>{inspection.notes}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">Editar</Button>
          {inspection.status !== "completed" && (
            <Button>Marcar como concluída</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InspectionDetail;
