import React, { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import NotificationsCard from "@/components/dashboard/NotificationsCard";
import { Users, Bike, Calendar, ChartBar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Customer, Inspection, SalesData, NotificationItem } from "@/types";

const Dashboard = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*");
        
        if (customersError) throw customersError;
        
        // Transform customer data to match our Customer type
        const transformedCustomers: Customer[] = (customersData || []).map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          birthdate: customer.birthdate || "",
          address: customer.address || "",
          createdAt: customer.created_at
        }));
        
        setCustomers(transformedCustomers);
        
        // Load inspections
        const { data: inspectionsData, error: inspectionsError } = await supabase
          .from("inspections")
          .select(`
            id,
            customer_id,
            customers(name),
            bike_id,
            bikes(model, serial_number),
            date,
            next_inspection_date,
            status,
            notes
          `);
        
        if (inspectionsError) throw inspectionsError;
        
        const transformedInspections: Inspection[] = (inspectionsData || []).map(item => {
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
        
        setInspections(transformedInspections);
        
        // Load sales data
        const { data: salesData, error: salesError } = await supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: true });
        
        if (salesError) throw salesError;
        
        if ((salesData || []).length === 0) {
          // If no sales data, use mock data temporarily
          setSalesData([
            { month: "Jan", inspections: 10, sales: 2500 },
            { month: "Feb", inspections: 15, sales: 3000 },
            { month: "Mar", inspections: 20, sales: 4500 },
            { month: "Apr", inspections: 25, sales: 5000 },
            { month: "May", inspections: 22, sales: 4800 },
            { month: "Jun", inspections: 30, sales: 6000 },
          ]);
        } else {
          setSalesData(salesData);
        }
        
        // Load notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .order("date", { ascending: false })
          .limit(5);
        
        if (notificationsError) throw notificationsError;
        
        // Transform notification data to match our NotificationItem type
        const transformedNotifications: NotificationItem[] = (notificationsData || []).map(notification => {
          // Map the type to one of our allowed types
          let typedType: "inspection" | "birthday" | "system" = "system";
          
          if (notification.type === "inspection" || notification.type === "birthday") {
            typedType = notification.type as "inspection" | "birthday";
          }
          
          return {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: typedType,
            read: notification.read,
            date: notification.date
          };
        });
        
        setNotifications(transformedNotifications);
        
        // If no notifications, use mock data temporarily
        if ((notificationsData || []).length === 0) {
          setNotifications([
            {
              id: "1",
              title: "Inspeção Agendada",
              message: "Nova inspeção agendada para amanhã às 10:00",
              type: "inspection",
              read: false,
              date: new Date().toISOString()
            },
            {
              id: "2",
              title: "Aniversário",
              message: "João Silva faz aniversário hoje",
              type: "birthday",
              read: true,
              date: new Date().toISOString()
            }
          ]);
        }
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [toast]);
  
  // Calculate statistics
  const customerCount = customers.length;
  const inspectionCount = inspections.length;
  const completedInspections = inspections.filter(
    (inspection) => inspection.status === "completed"
  ).length;
  const pendingInspections = inspections.filter(
    (inspection) => inspection.status === "pending"
  ).length;
  const salesSum = salesData.reduce(
    (acc, item) => acc + Number(item.sales),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ambikes-orange"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Clientes Registrados"
              value={customers.length}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              title="Total de Inspeções"
              value={inspections.length}
              description={`${inspections.filter(i => i.status === "completed").length} concluídas, ${inspections.filter(i => i.status === "pending").length} pendentes`}
              icon={<Bike className="h-4 w-4" />}
            />
            <StatCard
              title="Próximas Inspeções"
              value={inspections.filter(i => i.status === "pending").length}
              description="Para serem agendadas"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
              title="Vendas Totais"
              value={`€${salesData.reduce((acc, item) => acc + Number(item.sales), 0)}`}
              description="Este ano"
              icon={<ChartBar className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-4">
            {/* Full-width chart */}
            <SalesChart data={salesData} />
            
            {/* Full-width notifications under the chart */}
            <NotificationsCard notifications={notifications} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
