
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SalesChart from "@/components/dashboard/SalesChart";
import { mockSalesData } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <Button>Exportar Dados</Button>
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
              <SalesChart data={mockSalesData} title="Vendas Anuais" />
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
