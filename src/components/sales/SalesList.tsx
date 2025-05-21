
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Sale {
  id: string;
  date: string;
  product_name: string;
  price: number;
  customer_name: string;
  bike_model?: string;
  invoice_file?: string;
  customer_id?: string;
}

interface SalesListProps {
  onViewInvoice?: (invoiceFile: string) => void;
}

const SalesList: React.FC<SalesListProps> = ({ onViewInvoice }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      // Query sales with customer names
      const { data, error } = await supabase
        .from("sales")
        .select(`
          id, 
          date, 
          product_name, 
          price, 
          customer_id,
          customers (name),
          bike_model,
          invoice_file
        `)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }
      
      // Ensure data is an array before mapping
      if (Array.isArray(data)) {
        // Format the data to include customer name
        const formattedSales = data.map((sale) => ({
          id: sale.id,
          date: sale.date,
          product_name: sale.product_name,
          price: sale.price,
          customer_name: sale.customers?.name || "Cliente não especificado",
          bike_model: sale.bike_model,
          invoice_file: sale.invoice_file,
          customer_id: sale.customer_id,
        }));
        
        setSales(formattedSales);
      } else {
        setSales([]);
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível carregar a lista de vendas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const handleViewInvoice = (invoiceFile: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    if (invoiceFile && onViewInvoice) {
      onViewInvoice(invoiceFile);
    } else if (invoiceFile) {
      window.open(invoiceFile, '_blank');
    } else {
      toast({
        title: "Fatura não disponível",
        description: "Esta venda não possui uma fatura associada.",
        variant: "default",
      });
    }
  };

  const handleViewDetails = (saleId: string) => {
    toast({
      title: "Detalhes da venda",
      description: `Visualizando detalhes da venda ${saleId.substring(0, 8)}`,
    });
    // For now we'll just show a toast, but you could navigate to a details page
    // navigate(`/sales/${saleId}`);
  };

  const goToCustomerDetails = (customerId?: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent other click handlers
    if (customerId) {
      navigate(`/clients/${customerId}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ambikes-orange"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma venda registrada.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow 
                key={sale.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewDetails(sale.id)}
              >
                <TableCell>{formatDate(sale.date)}</TableCell>
                <TableCell>
                  <div>
                    {sale.product_name}
                    {sale.bike_model && (
                      <div className="text-sm text-muted-foreground">
                        Bicicleta: {sale.bike_model}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-foreground hover:text-ambikes-orange"
                    onClick={(e) => goToCustomerDetails(sale.customer_id, e)}
                  >
                    {sale.customer_name}
                  </Button>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {sale.price !== undefined && sale.price !== null
                    ? `€${sale.price.toFixed(2)}`
                    : "-"
                  }
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {sale.invoice_file && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => handleViewInvoice(sale.invoice_file, e)} 
                        title="Ver fatura"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewDetails(sale.id)}
                      title="Ver detalhes"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SalesList;
