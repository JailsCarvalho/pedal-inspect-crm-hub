
import React from "react";
import { useNavigate } from "react-router-dom";
import { Inspection } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bike } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionsListProps {
  inspections: Inspection[];
}

export const InspectionsList: React.FC<InspectionsListProps> = ({ inspections }) => {
  const navigate = useNavigate();

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

  if (inspections.length === 0) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <p>Nenhuma inspeção encontrada para este cliente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
};
