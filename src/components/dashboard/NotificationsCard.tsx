
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { NotificationItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CheckCircle, ChevronRight, Mail, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { NotificationService } from "@/services/NotificationService";
import { useToast } from "@/hooks/use-toast";

interface NotificationsCardProps {
  notifications: NotificationItem[];
  onNotificationsUpdate?: () => void;
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ 
  notifications,
  onNotificationsUpdate 
}) => {
  const { toast } = useToast();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return <Calendar className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM, HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-blue-100 text-blue-800";
      case "inspection":
        return "bg-amber-100 text-amber-800";
      case "email":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const success = await NotificationService.markAsRead(id);
    
    if (success) {
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
      toast({
        title: "Notificação marcada como lida",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await NotificationService.markAllAsRead();
    
    if (success) {
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
      toast({
        title: "Todas as notificações marcadas como lidas",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Notificações Recentes</CardTitle>
        <Badge variant="outline">{notifications.length}</Badge>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${
                !notification.read ? "bg-muted/30" : ""
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`rounded-full p-2 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.date)}</p>
                </div>
              </div>
              <div className="flex items-center">
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Marcar como lida"
                    className="mr-1 h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="col-span-full flex items-center justify-center p-6 text-muted-foreground">
              Não há notificações recentes.
            </div>
          )}
        </div>
      </CardContent>
      {unreadCount > 0 && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={handleMarkAllAsRead}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NotificationsCard;
