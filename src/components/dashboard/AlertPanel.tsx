
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell, Calendar } from "lucide-react";
import { Customer, Inspection } from "@/types";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertPanelProps {
  customers: Customer[];
  inspections: Inspection[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ customers, inspections }) => {
  console.log("AlertPanel - Total customers:", customers.length);
  console.log("AlertPanel - Total inspections:", inspections.length);
  
  // Filtrar clientes que fazem aniversário hoje
  const birthdayCustomers = customers.filter((customer) => {
    if (!customer.birthdate) return false;
    
    const birthdate = new Date(customer.birthdate);
    const today = new Date();
    
    // Compara apenas mês e dia, ignorando o ano
    const isBirthday = 
      birthdate.getDate() === today.getDate() && 
      birthdate.getMonth() === today.getMonth();
      
    return isBirthday;
  });
  
  console.log("AlertPanel - Birthday customers found:", birthdayCustomers.length);
  
  // Filtrar inspeções que estão próximas (nos próximos 5 dias)
  const upcomingInspections = inspections.filter((inspection) => {
    if (!inspection.date) return false;
    
    const inspectionDate = new Date(inspection.date);
    const today = new Date();
    const daysDifference = differenceInDays(inspectionDate, today);
    
    // Mostra inspeções de hoje até 5 dias no futuro
    const isUpcoming = daysDifference >= 0 && daysDifference <= 5;
    return isUpcoming;
  });
  
  console.log("AlertPanel - Upcoming inspections found:", upcomingInspections.length);

  // Para testes, vamos sempre mostrar o painel mesmo sem alertas
  // Remova este código quando estiver em produção
  if (birthdayCustomers.length === 0 && upcomingInspections.length === 0) {
    console.log("AlertPanel - No alerts to show, but showing test panel anyway");
    return (
      <div className="mb-6 space-y-4">
        <Alert className="border-gray-200 bg-gray-50">
          <AlertTitle className="text-gray-800">Painel de Alertas Ativo</AlertTitle>
          <AlertDescription>
            Não há aniversários ou inspeções próximas para mostrar no momento.
            Este alerta aparecerá apenas quando houver aniversários no dia atual ou inspeções nos próximos 5 dias.
          </AlertDescription>
        </Alert>
      </div>
    );
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
