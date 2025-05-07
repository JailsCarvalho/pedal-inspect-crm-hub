
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell, Calendar } from "lucide-react";
import { Customer, Inspection } from "@/types";
import { format, isToday, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertPanelProps {
  customers: Customer[];
  inspections: Inspection[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ customers, inspections }) => {
  // Filtrar clientes que fazem aniversário hoje
  const birthdayCustomers = customers.filter((customer) => {
    if (!customer.birthdate) return false;
    
    const birthdate = new Date(customer.birthdate);
    const today = new Date();
    
    return (
      birthdate.getDate() === today.getDate() && 
      birthdate.getMonth() === today.getMonth()
    );
  });

  // Filtrar inspeções que estão próximas (nos próximos 5 dias)
  const upcomingInspections = inspections.filter((inspection) => {
    if (!inspection.date) return false;
    
    const inspectionDate = new Date(inspection.date);
    const today = new Date();
    const daysDifference = differenceInDays(inspectionDate, today);
    
    return daysDifference >= 0 && daysDifference <= 5;
  });

  const hasAlerts = birthdayCustomers.length > 0 || upcomingInspections.length > 0;

  if (!hasAlerts) {
    return null; // Não renderiza nada se não houver alertas
  }

  return (
    <div className="mb-6 space-y-4">
      {birthdayCustomers.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Aniversários Hoje</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {birthdayCustomers.map((customer) => (
                <li key={customer.id}>
                  <span className="font-medium">{customer.name}</span> - {customer.birthdate ? format(new Date(customer.birthdate), "dd 'de' MMMM", { locale: ptBR }) : ""}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {upcomingInspections.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Bell className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Inspeções Próximas</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {upcomingInspections.map((inspection) => {
                const inspectionDate = new Date(inspection.date);
                const isToday = differenceInDays(inspectionDate, new Date()) === 0;
                const days = differenceInDays(inspectionDate, new Date());
                
                return (
                  <li key={inspection.id}>
                    <span className="font-medium">{inspection.customerName}</span> - 
                    Bicicleta: {inspection.bikeModel} - 
                    {isToday 
                      ? " Hoje" 
                      : ` Em ${days} ${days === 1 ? 'dia' : 'dias'} (${format(inspectionDate, "dd/MM/yyyy", { locale: ptBR })})`}
                  </li>
                );
              })}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AlertPanel;
