
import React from "react";
import { Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, PhoneCall, Gift, MessageSquare, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientInfoCardProps {
  client: Customer;
  isBirthday: boolean;
  nextBirthdayDate: string | null;
  onSendBirthdayMessage: () => void;
  onEdit: () => void;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({
  client,
  isBirthday,
  nextBirthdayDate,
  onSendBirthdayMessage,
  onEdit
}) => {
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {client.name}
            {isBirthday && (
              <Badge className="ml-2 bg-pink-100 text-pink-800 hover:bg-pink-200">
                <Gift className="h-3 w-3 mr-1" /> Aniversário hoje!
              </Badge>
            )}
            {nextBirthdayDate && !isBirthday && (
              <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
                <Gift className="h-3 w-3 mr-1" /> Aniversário {nextBirthdayDate}
              </Badge>
            )}
          </CardTitle>
          <div className="space-x-2">
            {client.phone && (
              <Button 
                onClick={onSendBirthdayMessage}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" /> 
                Enviar Mensagem de Aniversário
              </Button>
            )}
            <Button
              onClick={onEdit}
              variant="outline"
              className="flex items-center"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-center">
                <PhoneCall className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            
            {client.birthdate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Aniversário: {formatDate(client.birthdate)}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Cliente desde: {formatDate(client.createdAt)}</span>
            </div>
          </div>
          
          {client.address && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Endereço</p>
              <p>{client.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
