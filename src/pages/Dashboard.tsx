
import React from "react";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import NotificationsCard from "@/components/dashboard/NotificationsCard";
import { mockSalesData, mockCustomers, mockInspections, mockNotifications } from "@/data/mockData";
import { Users, Bike, Calendar, ChartBar } from "lucide-react";

const Dashboard = () => {
  // Calculate some statistics
  const customerCount = mockCustomers.length;
  
  const inspectionCount = mockInspections.length;
  const completedInspections = mockInspections.filter(
    (inspection) => inspection.status === "completed"
  ).length;
  
  const pendingInspections = mockInspections.filter(
    (inspection) => inspection.status === "pending"
  ).length;
  
  const salesSum = mockSalesData.reduce(
    (acc, item) => acc + item.sales,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clientes Registrados"
          value={customerCount}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total de Inspeções"
          value={inspectionCount}
          description={`${completedInspections} concluídas, ${pendingInspections} pendentes`}
          icon={<Bike className="h-4 w-4" />}
        />
        <StatCard
          title="Próximas Inspeções"
          value={pendingInspections}
          description="Para serem agendadas"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Vendas Totais"
          value={`€${salesSum}`}
          description="Este ano"
          icon={<ChartBar className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <SalesChart data={mockSalesData} />
        <NotificationsCard notifications={mockNotifications} />
      </div>
    </div>
  );
};

export default Dashboard;
