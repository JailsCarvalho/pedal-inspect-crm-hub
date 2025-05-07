
import React, { useState, useEffect, useCallback } from "react";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import NotificationsCard from "@/components/dashboard/NotificationsCard";
import { Users, Bike, Calendar, ChevronRight, ChartBar } from "lucide-react";
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

  const loadNotifications = useCallback(async () => {
    try {
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
          date: notification.date,
          customer_id: notification.customer_id
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
      console.error("Error loading notifications:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as notificações."
      });
    }
  }, [toast]);

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
            notes,
            inspection_value
          `);
        
        if (inspectionsError) {
          console.error("Error loading inspections:", inspectionsError);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar as inspeções."
          });
          setInspections([]);
        } else {
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
              notes: item.notes || "",
              inspectionValue: item.inspection_value || 0
            };
          });
          
          setInspections(transformedInspections);
          
          // For sales data, we now use actual inspection values and don't use mock data
          // Group inspections by month and calculate total value
          const monthlyData: Record<string, { inspections: number, sales: number }> = {};
          const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
          
          // Initialize with empty data for all months
          monthNames.forEach(month => {
            monthlyData[month] = { inspections: 0, sales: 0 };
          });
          
          // Fill with actual data
          transformedInspections.forEach(inspection => {
            if (inspection.date) {
              const date = new Date(inspection.date);
              const month = monthNames[date.getMonth()];
              
              if (month && monthlyData[month]) {
                monthlyData[month].inspections += 1;
                // Only add inspection value if it's completed
                if (inspection.status === "completed" && inspection.inspectionValue) {
                  monthlyData[month].sales += Number(inspection.inspectionValue);
                }
              }
            }
          });
          
          // Convert to array format for the chart
          const chartData: SalesData[] = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            inspections: data.inspections,
            sales: data.sales
          }));
          
          setSalesData(chartData);
        }
        
        // Load notifications
        await loadNotifications();
        
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
  }, [toast, loadNotifications]);
  
  // Calculate statistics
  const customerCount = customers.length;
  const inspectionCount = inspections.length;
  const completedInspections = inspections.filter(
    (inspection) => inspection.status === "completed"
  ).length;
  const pendingInspections = inspections.filter(
    (inspection) => inspection.status === "pending"
  ).length;
  const inspectionValueSum = inspections.reduce(
    (acc, item) => acc + Number(item.inspectionValue || 0),
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
              title="Valor de Inspeções"
              value={`€${inspectionValueSum}`}
              description="Total"
              icon={<ChartBar className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-4">
            {/* Full-width chart */}
            <SalesChart data={salesData} />
            
            {/* Full-width notifications under the chart */}
            <NotificationsCard 
              notifications={notifications} 
              onNotificationsUpdate={loadNotifications}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
