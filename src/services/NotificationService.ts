
import { supabase } from "@/integrations/supabase/client";
import { NotificationItem } from "@/types";
import { toast } from "@/components/ui/sonner";

export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface BirthdayEmailData {
  customerName: string;
  birthdayDate: string;
  couponCode?: string;
}

export interface InspectionEmailData {
  customerName: string;
  bikeModel: string;
  inspectionDate: string;
  inspectionTime: string;
  shopAddress: string;
  contactPhone: string;
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
        toast("Erro ao enviar email", {
          description: "Não foi possível enviar a notificação por email."
        });
        return false;
      }

      toast("Email enviado", {
        description: "Notificação por email enviada com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error("Error sending email notification:", error);
      toast("Erro ao enviar email", {
        description: "Não foi possível enviar a notificação por email."
      });
      return false;
    }
  }

  /**
   * Sends a birthday email notification using a template
   */
  static async sendBirthdayEmail(to: string, data: BirthdayEmailData): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to,
          template: "birthday",
          templateData: data
        },
      });

      if (error) {
        console.error("Error sending birthday notification:", error);
        toast("Erro ao enviar email de aniversário", {
          description: "Não foi possível enviar a notificação de aniversário."
        });
        return false;
      }

      toast("Email de aniversário enviado", {
        description: "Notificação de aniversário enviada com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error("Error sending birthday notification:", error);
      toast("Erro ao enviar email de aniversário", {
        description: "Não foi possível enviar a notificação de aniversário."
      });
      return false;
    }
  }

  /**
   * Sends an inspection reminder email notification using a template
   */
  static async sendInspectionEmail(to: string, data: InspectionEmailData): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to,
          template: "inspection",
          templateData: data
        },
      });

      if (error) {
        console.error("Error sending inspection notification:", error);
        toast("Erro ao enviar lembrete de inspeção", {
          description: "Não foi possível enviar o lembrete de inspeção."
        });
        return false;
      }

      toast("Lembrete de inspeção enviado", {
        description: "Notificação de inspeção enviada com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error("Error sending inspection notification:", error);
      toast("Erro ao enviar lembrete de inspeção", {
        description: "Não foi possível enviar o lembrete de inspeção."
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
   * Creates a birthday notification and sends a birthday email
   */
  static async sendBirthdayNotification(
    customer: { id: string, name: string, email: string },
    birthdayDate: string,
    couponCode?: string
  ): Promise<boolean> {
    // Create notification in database
    const notification: Omit<NotificationItem, "id" | "date"> = {
      title: `Aniversário: ${customer.name}`,
      message: `Hoje é aniversário de ${customer.name}. Um email de parabéns foi enviado.`,
      type: "birthday",
      read: false,
      customer_id: customer.id
    };

    const dbNotification = await this.createNotification(notification);
    
    // Send email if customer has email
    let emailSent = false;
    if (customer.email) {
      emailSent = await this.sendBirthdayEmail(customer.email, {
        customerName: customer.name,
        birthdayDate,
        couponCode
      });
    }
    
    return !!dbNotification;
  }

  /**
   * Creates an inspection notification and sends an inspection reminder email
   */
  static async sendInspectionNotification(
    customer: { id: string, name: string, email: string },
    bikeModel: string,
    inspectionDate: string,
    inspectionTime: string,
    shopAddress: string = "Rua Principal, 123, Lisboa",
    contactPhone: string = "21 123 4567"
  ): Promise<boolean> {
    // Create notification in database
    const notification: Omit<NotificationItem, "id" | "date"> = {
      title: `Lembrete de Inspeção`,
      message: `Inspeção agendada para ${inspectionDate} às ${inspectionTime} para ${customer.name}.`,
      type: "inspection",
      read: false,
      customer_id: customer.id
    };

    const dbNotification = await this.createNotification(notification);
    
    // Send email if customer has email
    let emailSent = false;
    if (customer.email) {
      emailSent = await this.sendInspectionEmail(customer.email, {
        customerName: customer.name,
        bikeModel,
        inspectionDate,
        inspectionTime,
        shopAddress,
        contactPhone
      });
    }
    
    return !!dbNotification;
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
