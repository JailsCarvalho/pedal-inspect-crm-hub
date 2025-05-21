
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SalesChart from "@/components/dashboard/SalesChart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SalesData, Inspection } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subMonths, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChartBarIcon, ChartLineIcon } from "lucide-react";

const Reports = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 12),
    to: new Date(),
  });
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoading(true);
        
        // Load sales data within date range
        const { data: salesRecords, error: salesError } = await supabase
          .from("sales")
          .select(`
            id,
            date,
            price,
            bike_model
          `)
          .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('date', format(dateRange.to, 'yyyy-MM-dd'));
        
        if (salesError) throw salesError;
        
        // Load inspections within date range
        const { data: inspectionsData, error: inspectionsError } = await supabase
          .from("inspections")
          .select(`
            id,
            date,
            status,
            inspection_value,
            next_inspection_date,
            labor_cost
          `)
          .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('date', format(dateRange.to, 'yyyy-MM-dd'));
        
        if (inspectionsError) throw inspectionsError;
        
        // Group data by month and calculate total values
        const monthlyData: Record<string, { inspections: number, inspectionCount: number, sales: number, salesCount: number }> = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        // Initialize with empty data for all months in the date range
        let currentDate = new Date(dateRange.from);
        while (currentDate <= dateRange.to) {
          const monthIndex = currentDate.getMonth();
          const year = currentDate.getFullYear();
          const monthKey = `${monthNames[monthIndex]}-${year}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { 
              inspections: 0, 
              inspectionCount: 0, 
              sales: 0,
              salesCount: 0
            };
          }
          
          // Move to next month
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        }
        
        // Process sales data
        (salesRecords || []).forEach((sale: any) => {
          if (sale.date) {
            const date = new Date(sale.date);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const monthKey = `${month}-${year}`;
            
            if (monthKey && monthlyData[monthKey]) {
              monthlyData[monthKey].sales += Number(sale.price || 0);
              monthlyData[monthKey].salesCount += 1;
            }
          }
        });
        
        // Process inspections data
        (inspectionsData || []).forEach((inspection: any) => {
          if (inspection.date) {
            const date = new Date(inspection.date);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const monthKey = `${month}-${year}`;
            
            if (monthKey && monthlyData[monthKey]) {
              // Only add inspection value if it's completed
              if (inspection.status === "completed") {
                const inspectionValue = Number(inspection.inspection_value || 0);
                const laborCost = Number(inspection.labor_cost || 0);
                monthlyData[monthKey].inspections += inspectionValue + laborCost;
              }
              monthlyData[monthKey].inspectionCount += 1;
            }
          }
        });
        
        // Convert to array format for the chart
        const chartData: SalesData[] = Object.entries(monthlyData).map(([monthYear, data]) => {
          const [month, year] = monthYear.split('-');
          return {
            month: `${month} ${year}`,
            inspections: data.inspectionCount,
            sales: data.sales,
            inspectionValue: data.inspections,
            salesCount: data.salesCount
          };
        });
        
        // Sort by date (assuming month-year format)
        chartData.sort((a, b) => {
          const [monthA, yearA] = a.month.split(' ');
          const [monthB, yearB] = b.month.split(' ');
          
          if (yearA !== yearB) {
            return parseInt(yearA) - parseInt(yearB);
          }
          
          const monthOrder: Record<string, number> = {};
          monthNames.forEach((month, index) => {
            monthOrder[month] = index;
          });
          
          return monthOrder[monthA] - monthOrder[monthB];
        });
        
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
  }, [toast, dateRange]);
  
  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para exportação"
    });
    // Implementation for export functionality would go here
  };

  const handleSetFullYear = () => {
    const now = new Date();
    setDateRange({
      from: startOfYear(now),
      to: endOfYear(now)
    });
  };

  const handleSetThreeMonths = () => {
    setDateRange({
      from: subMonths(new Date(), 3),
      to: new Date()
    });
  };

  const handleSetSixMonths = () => {
    setDateRange({
      from: subMonths(new Date(), 6),
      to: new Date()
    });
  };

  // Handle date range selection from calendar
  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <Button onClick={handleExport}>Exportar Dados</Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Selecionar período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleDateRangeSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSetThreeMonths}>
            3 meses
          </Button>
          <Button variant="outline" size="sm" onClick={handleSetSixMonths}>
            6 meses
          </Button>
          <Button variant="outline" size="sm" onClick={handleSetFullYear}>
            Ano atual
          </Button>
        </div>
        
        <div className="ml-auto flex gap-2">
          <Button 
            variant={chartType === "line" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setChartType("line")}
          >
            <ChartLineIcon className="h-4 w-4 mr-1" /> Linha
          </Button>
          <Button 
            variant={chartType === "bar" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setChartType("bar")}
          >
            <ChartBarIcon className="h-4 w-4 mr-1" /> Barra
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="sales">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="inspections">Inspeções</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
              <CardDescription>
                Visão geral das vendas ao longo do tempo (€{salesData.reduce((acc, data) => acc + data.sales, 0).toFixed(2)})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[350px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ambikes-orange"></div>
                </div>
              ) : (
                <SalesChart 
                  data={salesData} 
                  title="Vendas por Período" 
                  chartType={chartType}
                  valueField="sales"
                  countField="salesCount" 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inspections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Inspeções</CardTitle>
              <CardDescription>
                Análise de inspeções realizadas e valores gerados (€{salesData.reduce((acc, data) => acc + (data.inspectionValue || 0), 0).toFixed(2)})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[350px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ambikes-orange"></div>
                </div>
              ) : (
                <SalesChart 
                  data={salesData} 
                  title="Inspeções por Período" 
                  chartType={chartType} 
                  valueField="inspectionValue"
                  countField="inspections"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
