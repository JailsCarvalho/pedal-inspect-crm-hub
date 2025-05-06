
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Inspection } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Check, Clock, Search, X } from "lucide-react";
import { NewInspectionDialog } from "./NewInspectionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const InspectionsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isNewInspectionDialogOpen, setIsNewInspectionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      // Fetch inspections with customer information
      const { data, error } = await supabase
        .from("inspections")
        .select(`
          id, 
          date, 
          next_inspection_date, 
          status, 
          notes,
          customer_id,
          customers(name),
          bike_id,
          bikes(model, serial_number)
        `)
        .order("date", { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match our Inspection type
      const transformedData: Inspection[] = (data || []).map(item => {
        // Ensure status is one of the allowed values
        let typedStatus: "scheduled" | "completed" | "pending" | "cancelled" = "pending";
        
        if (item.status === "scheduled" || item.status === "completed" || 
            item.status === "pending" || item.status === "cancelled") {
          typedStatus = item.status as "scheduled" | "completed" | "pending" | "cancelled";
        }
        
        return {
          id: item.id,
          customerId: item.customer_id,
          customerName: item.customers?.name || "Unknown",
          bikeModel: item.bikes?.model || "Unknown",
          bikeSerialNumber: item.bikes?.serial_number || "",
          date: item.date,
          nextInspectionDate: item.next_inspection_date,
          status: typedStatus,
          notes: item.notes || ""
        };
      });
      
      setInspections(transformedData);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as inspeções. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInspections = inspections.filter(
    (inspection) =>
      inspection.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.bikeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inspection.bikeSerialNumber && inspection.bikeSerialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><Check className="h-3 w-3 mr-1" /> Concluída</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Calendar className="h-3 w-3 mr-1" /> Agendada</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><X className="h-3 w-3 mr-1" /> Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Procurar inspeções..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="ml-2" onClick={() => setIsNewInspectionDialogOpen(true)}>
          Nova Inspeção
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Bicicleta</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Próxima Inspeção</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Carregando inspeções...
                </TableCell>
              </TableRow>
            ) : filteredInspections.length > 0 ? (
              filteredInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium">{inspection.customerName}</TableCell>
                  <TableCell>
                    {inspection.bikeModel}
                    {inspection.bikeSerialNumber && (
                      <div className="text-xs text-muted-foreground">
                        SN: {inspection.bikeSerialNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(inspection.date)}</TableCell>
                  <TableCell>{formatDate(inspection.nextInspectionDate)}</TableCell>
                  <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma inspeção encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewInspectionDialog
        open={isNewInspectionDialogOpen}
        onOpenChange={setIsNewInspectionDialogOpen}
        onInspectionCreated={fetchInspections}
      />
    </div>
  );
};

export default InspectionsList;
