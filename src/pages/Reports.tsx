
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SalesChart from "@/components/dashboard/SalesChart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SalesData, Inspection } from "@/types";

const Reports = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoading(true);
        
        // Load inspections to calculate sales data
        const { data: inspectionsData, error: inspectionsError } = await supabase
          .from("inspections")
          .select(`
            id,
            date,
            status,
            inspection_value
          `);
        
        if (inspectionsError) throw inspectionsError;
        
        // Group inspections by month and calculate total value
        const monthlyData: Record<string, { inspections: number, sales: number }> = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        // Initialize with empty data for all months
        monthNames.forEach(month => {
          monthlyData[month] = { inspections: 0, sales: 0 };
        });
        
        // Fill with actual data
        (inspectionsData || []).forEach((inspection: any) => {
          if (inspection.date) {
            const date = new Date(inspection.date);
            const month = monthNames[date.getMonth()];
            
            if (month && monthlyData[month]) {
              monthlyData[month].inspections += 1;
              // Only add inspection value if it's completed
              if (inspection.status === "completed" && inspection.inspection_value) {
                monthlyData[month].sales += Number(inspection.inspection_value);
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
      } catch (error) {
        console.error("Error loading report data:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados do relatório."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReportData();
  }, [toast]);
  
  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para exportação"
    });
    // Implementation for export functionality would go here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <Button onClick={handleExport}>Exportar Dados</Button>
      </div>
      
      <Tabs defaultValue="sales">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="inspections">Inspeções</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
              <CardDescription>
                Visão geral das vendas e inspeções ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[350px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ambikes-orange"></div>
                </div>
              ) : (
                <SalesChart data={salesData} title="Vendas Anuais" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Clientes</CardTitle>
              <CardDescription>
                Análise de novos clientes e retenção
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[400px] text-muted-foreground">
              Relatórios de clientes serão implementados em breve.
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inspections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Inspeções</CardTitle>
              <CardDescription>
                Análise de inspeções realizadas e pendentes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[400px] text-muted-foreground">
              Relatórios de inspeções serão implementados em breve.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
