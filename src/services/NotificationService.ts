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

  /**
   * Sends a test email to the specified address
   */
  static async sendTestEmail(to: string): Promise<boolean> {
    const currentDate = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create a test notification in the database
    const notification: Omit<NotificationItem, "id" | "date"> = {
      title: "Email de Teste",
      message: `Email de teste enviado para ${to} em ${currentDate}.`,
      type: "email",
      read: false
    };
    
    // Prepare email content
    const emailData: EmailNotification = {
      to,
      subject: "Email de Teste da Ambikes",
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email de Teste</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #FF7E00;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
              border-left: 1px solid #eeeeee;
              border-right: 1px solid #eeeeee;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #666666;
              border-radius: 0 0 5px 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Email de Teste da Ambikes</h1>
            </div>
            <div class="content">
              <p>Olá!</p>
              
              <p>Este é um email de teste do sistema de notificações da Ambikes.</p>
              
              <p>Data e hora do envio: <strong>${currentDate}</strong></p>
              
              <p>Este email confirma que o sistema de notificações está funcionando corretamente.</p>
              
              <p>Obrigado por utilizar nossos serviços!</p>
              
              <p>Atenciosamente,<br>
              Equipe Ambikes</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ambikes. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Email de Teste da Ambikes
        
        Olá!
        
        Este é um email de teste do sistema de notificações da Ambikes.
        
        Data e hora do envio: ${currentDate}
        
        Este email confirma que o sistema de notificações está funcionando corretamente.
        
        Obrigado por utilizar nossos serviços!
        
        Atenciosamente,
        Equipe Ambikes
        
        © ${new Date().getFullYear()} Ambikes. Todos os direitos reservados.
      `
    };
    
    // Create notification in database and send email
    return this.notifyWithEmail(notification, emailData);
  }
}
