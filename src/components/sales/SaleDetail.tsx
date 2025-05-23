
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SaleDetail {
  id: string;
  date: string;
  product_name: string;
  price: number;
  customer_name: string;
  customer_id?: string;
  bike_model?: string;
  bike_serial_number?: string;
  notes?: string;
  invoice_file?: string;
}

interface SaleDetailProps {
  onViewInvoice: (invoiceFile: string) => void;
}

const SaleDetail: React.FC<SaleDetailProps> = ({ onViewInvoice }) => {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchSaleDetails(id);
    }
  }, [id]);

  const fetchSaleDetails = async (saleId: string) => {
    try {
      setIsLoading(true);
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
          bike_serial_number,
          notes,
          invoice_file
        `)
        .eq("id", saleId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setSale({
          id: data.id,
          date: data.date,
          product_name: data.product_name,
          price: data.price,
          customer_name: data.customers?.name || "Cliente não especificado",
          customer_id: data.customer_id,
          bike_model: data.bike_model,
          bike_serial_number: data.bike_serial_number,
          notes: data.notes,
          invoice_file: data.invoice_file,
        });
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da venda.",
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

  const handleViewInvoice = () => {
    if (sale?.invoice_file) {
      onViewInvoice(sale.invoice_file);
    } else {
      toast({
        title: "Fatura não disponível",
        description: "Esta venda não possui uma fatura associada.",
      });
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const goToCustomerDetails = () => {
    if (sale?.customer_id) {
      navigate(`/clients/${sale.customer_id}`);
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

  if (!sale) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertTitle>Venda não encontrada</AlertTitle>
            <AlertDescription>
              Não foi possível encontrar os detalhes desta venda.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={goBack} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Detalhes da Venda</h2>
        <Button onClick={goBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Dados Gerais</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Produto</p>
                  <p className="font-medium">{sale.product_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p>{formatDate(sale.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço</p>
                  <p className="font-medium">€{sale.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-foreground hover:text-ambikes-orange"
                    onClick={goToCustomerDetails}
                  >
                    {sale.customer_name}
                  </Button>
                </div>
              </div>
            </div>

            {(sale.bike_model || sale.bike_serial_number) && (
              <div>
                <h3 className="text-lg font-medium mb-4">Dados da Bicicleta</h3>
                <div className="space-y-3">
                  {sale.bike_model && (
                    <div>
                      <p className="text-sm text-muted-foreground">Modelo</p>
                      <p>{sale.bike_model}</p>
                    </div>
                  )}
                  {sale.bike_serial_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Número de Série</p>
                      <p>{sale.bike_serial_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {sale.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Observações</h3>
              <p className="text-sm">{sale.notes}</p>
            </div>
          )}
        </CardContent>
        {sale.invoice_file && (
          <CardFooter>
            <Button 
              onClick={handleViewInvoice} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Ver Fatura
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SaleDetail;
