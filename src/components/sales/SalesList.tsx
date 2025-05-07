
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sale } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SalesList = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        
        // Busca as vendas e as informações dos clientes
        const { data, error } = await supabase
          .from("sales")
          .select(`
            id,
            customer_id,
            product_name,
            bike_model,
            bike_serial_number,
            price,
            date,
            notes,
            customers (name)
          `)
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        // Mapeia os resultados para o formato do componente
        const formattedSales = data.map((sale: any): Sale => ({
          id: sale.id,
          customerId: sale.customer_id,
          customerName: sale.customers?.name || "Cliente não encontrado",
          productName: sale.product_name,
          bikeModel: sale.bike_model,
          bikeSerialNumber: sale.bike_serial_number,
          price: sale.price,
          date: sale.date,
          notes: sale.notes
        }));
        
        setSales(formattedSales);
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a lista de vendas."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSales();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ambikes-orange"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Modelo da Bike</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Nenhuma venda registrada
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {format(new Date(sale.date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{sale.customerName}</TableCell>
                <TableCell>{sale.productName}</TableCell>
                <TableCell>{sale.bikeModel || "-"}</TableCell>
                <TableCell>R$ {sale.price.toFixed(2).replace(".", ",")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesList;
