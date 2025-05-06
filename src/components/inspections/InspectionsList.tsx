
import React, { useState } from "react";
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

interface InspectionsListProps {
  inspections: Inspection[];
}

const InspectionsList: React.FC<InspectionsListProps> = ({ inspections }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInspections = inspections.filter(
    (inspection) =>
      inspection.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.bikeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.bikeSerialNumber.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Button className="ml-2">Nova Inspeção</Button>
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
            {filteredInspections.length > 0 ? (
              filteredInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium">{inspection.customerName}</TableCell>
                  <TableCell>
                    {inspection.bikeModel}
                    <div className="text-xs text-muted-foreground">
                      SN: {inspection.bikeSerialNumber}
                    </div>
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
    </div>
  );
};

export default InspectionsList;
