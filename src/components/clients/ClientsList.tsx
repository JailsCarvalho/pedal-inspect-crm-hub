
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { format, parse, isValid, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Mail, PhoneCall, Search, Gift } from "lucide-react";
import { NewClientDialog } from "./NewClientDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ClientsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      // Transform data to match our Customer type
      const transformedData: Customer[] = (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        birthdate: customer.birthdate || "",
        address: customer.address || "",
        createdAt: customer.created_at
      }));
      
      setCustomers(transformedData);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os clientes. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
  );

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "";
    }
  };

  const isBirthdayToday = (birthdate: string): boolean => {
    if (!birthdate) return false;
    
    try {
      const today = new Date();
      // Try to parse the date - it might be in different formats
      let birthdateDate;
      try {
        // Try ISO format first
        birthdateDate = parseISO(birthdate);
      } catch {
        try {
          // Try another common format
          birthdateDate = parse(birthdate, "yyyy-MM-dd", new Date());
        } catch {
          return false;
        }
      }
      
      if (!isValid(birthdateDate)) return false;
      
      return (
        birthdateDate.getDate() === today.getDate() &&
        birthdateDate.getMonth() === today.getMonth()
      );
    } catch (e) {
      return false;
    }
  };

  const isBirthdaySoon = (birthdate: string): boolean => {
    if (!birthdate) return false;
    
    try {
      const today = new Date();
      // Try to parse the date
      let birthdateDate;
      try {
        birthdateDate = parseISO(birthdate);
      } catch {
        try {
          birthdateDate = parse(birthdate, "yyyy-MM-dd", new Date());
        } catch {
          return false;
        }
      }
      
      if (!isValid(birthdateDate)) return false;
      
      // Create date for this year's birthday
      const birthdateThisYear = new Date(
        today.getFullYear(),
        birthdateDate.getMonth(),
        birthdateDate.getDate()
      );
      
      // If the birthday has passed this year, check for next year
      if (birthdateThisYear < today) {
        birthdateThisYear.setFullYear(birthdateThisYear.getFullYear() + 1);
      }
      
      const daysDifference = differenceInDays(birthdateThisYear, today);
      
      // Return true if birthday is within the next 7 days
      return daysDifference > 0 && daysDifference <= 7;
    } catch (e) {
      return false;
    }
  };
  
  const getDaysUntilBirthday = (birthdate: string): number | null => {
    if (!birthdate) return null;
    
    try {
      const today = new Date();
      // Try to parse the date
      let birthdateDate;
      try {
        birthdateDate = parseISO(birthdate);
      } catch {
        try {
          birthdateDate = parse(birthdate, "yyyy-MM-dd", new Date());
        } catch {
          return null;
        }
      }
      
      if (!isValid(birthdateDate)) return null;
      
      // Create date for this year's birthday
      const birthdateThisYear = new Date(
        today.getFullYear(),
        birthdateDate.getMonth(),
        birthdateDate.getDate()
      );
      
      // If the birthday has passed this year, check for next year
      if (birthdateThisYear < today) {
        birthdateThisYear.setFullYear(birthdateThisYear.getFullYear() + 1);
      }
      
      return differenceInDays(birthdateThisYear, today);
    } catch (e) {
      return null;
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Procurar clientes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="ml-2" onClick={() => setIsNewClientDialogOpen(true)}>
          Novo Cliente
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Aniversário</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Cliente desde</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Carregando clientes...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  className={isBirthdayToday(customer.birthdate) ? "bg-pink-50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {customer.name}
                      {isBirthdayToday(customer.birthdate) && (
                        <Badge className="ml-2 bg-pink-100 text-pink-800 hover:bg-pink-200">
                          <Gift className="h-3 w-3 mr-1" /> Hoje!
                        </Badge>
                      )}
                      {!isBirthdayToday(customer.birthdate) && isBirthdaySoon(customer.birthdate) && (
                        <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
                          <Gift className="h-3 w-3 mr-1" /> Em {getDaysUntilBirthday(customer.birthdate)} dias
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <PhoneCall className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.birthdate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(customer.birthdate)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/clients/${customer.id}`)}
                    >
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewClientDialog 
        open={isNewClientDialogOpen} 
        onOpenChange={setIsNewClientDialogOpen}
        onClientCreated={fetchCustomers}
      />
    </div>
  );
};

export default ClientsList;
