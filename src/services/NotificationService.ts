
import { supabase } from "@/integrations/supabase/client";
import { NotificationItem } from "@/types";
import { toast } from "@/components/ui/sonner";

export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class NotificationService {
  /**
   * Creates a notification in the database
   */
  static async createNotification(notification: Omit<NotificationItem, "id" | "date">): Promise<NotificationItem | null> {
    try {
      const newNotification = {
        ...notification,
        date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("notifications")
        .insert(newNotification)
        .select("*")
        .single();

      if (error) {
        console.error("Error creating notification:", error);
        return null;
      }

      return data as NotificationItem;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  /**
   * Sends an email notification using the Supabase Edge Function
   */
  static async sendEmail(emailData: EmailNotification): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: emailData,
      });

      if (error) {
        console.error("Error sending email notification:", error);
        toast({
          title: "Erro ao enviar email",
          description: "Não foi possível enviar a notificação por email.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Email enviado",
        description: "Notificação por email enviada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar a notificação por email.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Creates a notification and sends an email
   */
  static async notifyWithEmail(
    notification: Omit<NotificationItem, "id" | "date">, 
    emailData: EmailNotification
  ): Promise<boolean> {
    const dbNotification = await this.createNotification(notification);
    const emailSent = await this.sendEmail(emailData);
    
    return !!dbNotification && emailSent;
  }

  /**
   * Marks a notification as read
   */
  static async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) {
        console.error("Error marking notification as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }
  
  /**
   * Marks all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }
}
