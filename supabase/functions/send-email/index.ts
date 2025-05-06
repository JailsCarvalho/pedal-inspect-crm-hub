
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  from?: string;
  template?: "birthday" | "inspection";
  templateData?: BirthdayTemplateData | InspectionTemplateData;
}

interface BirthdayTemplateData {
  customerName: string;
  birthdayDate: string;
  couponCode?: string;
}

interface InspectionTemplateData {
  customerName: string;
  bikeModel: string;
  inspectionDate: string;
  inspectionTime: string;
  shopAddress: string;
  contactPhone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailRequest = await req.json();
    let { 
      to, 
      subject, 
      htmlContent, 
      textContent, 
      from = "Ambikes <onboarding@resend.dev>", 
      template, 
      templateData 
    } = requestData;

    // If a template is specified, generate the content
    if (template && templateData) {
      const generatedContent = generateEmailContent(template, templateData);
      subject = generatedContent.subject;
      htmlContent = generatedContent.htmlContent;
      textContent = generatedContent.textContent;
    }

    if (!to || !subject || !htmlContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, or htmlContent" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: htmlContent,
      text: textContent,
    });

    console.log("Email sent successfully:", JSON.stringify(emailResponse));

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateEmailContent(
  template: "birthday" | "inspection",
  data: BirthdayTemplateData | InspectionTemplateData
): { subject: string; htmlContent: string; textContent: string } {
  switch (template) {
    case "birthday":
      return generateBirthdayEmail(data as BirthdayTemplateData);
    case "inspection":
      return generateInspectionEmail(data as InspectionTemplateData);
    default:
      throw new Error("Unsupported template type");
  }
}

function generateBirthdayEmail(data: BirthdayTemplateData) {
  const { customerName, birthdayDate, couponCode } = data;
  const discountCode = couponCode || "ANIVERSARIO10";
  
  const subject = `Feliz Aniversário, ${customerName}! 🎂 Um presente especial da Ambikes`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feliz Aniversário!</title>
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
        .coupon {
          background-color: #f8f8f8;
          border: 2px dashed #FF7E00;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .coupon-code {
          font-size: 24px;
          font-weight: bold;
          color: #FF7E00;
          letter-spacing: 2px;
        }
        .button {
          display: inline-block;
          background-color: #FF7E00;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 15px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎂 Feliz Aniversário, ${customerName}! 🎉</h1>
        </div>
        <div class="content">
          <p>Olá, ${customerName}!</p>
          <p>Toda a equipe da Ambikes deseja a você um <strong>feliz aniversário</strong>! 🎉</p>
          <p>Para comemorar o seu dia especial, preparamos um presente exclusivo para você:</p>
          
          <div class="coupon">
            <p>Ganhe <strong>10% de desconto</strong> em qualquer serviço da nossa oficina!</p>
            <p>Use o código promocional:</p>
            <p class="coupon-code">${discountCode}</p>
            <p><small>Válido por 30 dias a partir de hoje.</small></p>
          </div>
          
          <p>Aproveite esta oportunidade para fazer aquela manutenção que você vem adiando ou para comprar aquele acessório que tanto deseja para sua bicicleta.</p>
          
          <p>Agradecemos por confiar na Ambikes para cuidar da sua bike.</p>
          
          <div style="text-align: center">
            <a href="https://www.ambikes.com/agendamento" class="button">Agendar uma Visita</a>
          </div>
          
          <p>Melhores cumprimentos,<br>
          Equipe Ambikes</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Ambikes. Todos os direitos reservados.</p>
          <p>Você recebeu este e-mail porque é cliente da Ambikes.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Feliz Aniversário, ${customerName}! 🎂
    
    Olá, ${customerName}!
    
    Toda a equipe da Ambikes deseja a você um feliz aniversário! 🎉
    
    Para comemorar o seu dia especial, preparamos um presente exclusivo para você:
    
    ------------------------------
    Ganhe 10% de desconto em qualquer serviço da nossa oficina!
    Use o código promocional: ${discountCode}
    Válido por 30 dias a partir de hoje.
    ------------------------------
    
    Aproveite esta oportunidade para fazer aquela manutenção que você vem adiando ou para comprar aquele acessório que tanto deseja para sua bicicleta.
    
    Agradecemos por confiar na Ambikes para cuidar da sua bike.
    
    Para agendar uma visita, acesse: https://www.ambikes.com/agendamento
    
    Melhores cumprimentos,
    Equipe Ambikes
    
    © ${new Date().getFullYear()} Ambikes. Todos os direitos reservados.
    Você recebeu este e-mail porque é cliente da Ambikes.
  `;

  return { subject, htmlContent, textContent };
}

function generateInspectionEmail(data: InspectionTemplateData) {
  const { customerName, bikeModel, inspectionDate, inspectionTime, shopAddress, contactPhone } = data;
  
  const subject = `Lembrete: Sua inspeção na Ambikes está agendada para ${inspectionDate}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lembrete de Inspeção</title>
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
        .details {
          background-color: #f8f8f8;
          border-left: 3px solid #FF7E00;
          padding: 15px;
          margin: 20px 0;
        }
        .details-row {
          display: flex;
          margin-bottom: 10px;
        }
        .details-label {
          width: 120px;
          font-weight: bold;
        }
        .button {
          display: inline-block;
          background-color: #FF7E00;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 15px;
          font-weight: bold;
        }
        .checklist {
          margin: 20px 0;
          padding-left: 20px;
        }
        .checklist li {
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Lembrete de Inspeção 🚲</h1>
        </div>
        <div class="content">
          <p>Olá, ${customerName}!</p>
          
          <p>Este é um lembrete amigável sobre sua <strong>inspeção de bicicleta</strong> agendada na Ambikes.</p>
          
          <div class="details">
            <div class="details-row">
              <div class="details-label">Bicicleta:</div>
              <div>${bikeModel}</div>
            </div>
            <div class="details-row">
              <div class="details-label">Data:</div>
              <div>${inspectionDate}</div>
            </div>
            <div class="details-row">
              <div class="details-label">Horário:</div>
              <div>${inspectionTime}</div>
            </div>
            <div class="details-row">
              <div class="details-label">Local:</div>
              <div>${shopAddress}</div>
            </div>
          </div>
          
          <p><strong>O que será verificado na inspeção:</strong></p>
          
          <ul class="checklist">
            <li>Verificação geral da condição dos componentes</li>
            <li>Ajuste de freios e marchas</li>
            <li>Lubrificação da corrente e partes móveis</li>
            <li>Calibragem dos pneus</li>
            <li>Verificação da suspensão (se aplicável)</li>
            <li>Aperto geral de parafusos e componentes</li>
          </ul>
          
          <p>Não se esqueça de trazer qualquer acessório relevante para sua bike e informar sobre quaisquer problemas específicos que você tenha notado recentemente.</p>
          
          <p>Se precisar reagendar ou tiver alguma dúvida, por favor entre em contato conosco pelo telefone <strong>${contactPhone}</strong>.</p>
          
          <div style="text-align: center">
            <a href="https://www.ambikes.com/minha-conta/agendamentos" class="button">Gerenciar Agendamento</a>
          </div>
          
          <p>Obrigado por escolher a Ambikes para cuidar da sua bicicleta!</p>
          
          <p>Atenciosamente,<br>
          Equipe Ambikes</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Ambikes. Todos os direitos reservados.</p>
          <p>Para cancelar esta inspeção, entre em contato conosco pelo telefone ${contactPhone}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Lembrete de Inspeção
    
    Olá, ${customerName}!
    
    Este é um lembrete amigável sobre sua inspeção de bicicleta agendada na Ambikes.
    
    Detalhes do agendamento:
    - Bicicleta: ${bikeModel}
    - Data: ${inspectionDate}
    - Horário: ${inspectionTime}
    - Local: ${shopAddress}
    
    O que será verificado na inspeção:
    * Verificação geral da condição dos componentes
    * Ajuste de freios e marchas
    * Lubrificação da corrente e partes móveis
    * Calibragem dos pneus
    * Verificação da suspensão (se aplicável)
    * Aperto geral de parafusos e componentes
    
    Não se esqueça de trazer qualquer acessório relevante para sua bike e informar sobre quaisquer problemas específicos que você tenha notado recentemente.
    
    Se precisar reagendar ou tiver alguma dúvida, por favor entre em contato conosco pelo telefone ${contactPhone}.
    
    Para gerenciar seu agendamento online, acesse: https://www.ambikes.com/minha-conta/agendamentos
    
    Obrigado por escolher a Ambikes para cuidar da sua bicicleta!
    
    Atenciosamente,
    Equipe Ambikes
    
    © ${new Date().getFullYear()} Ambikes. Todos os direitos reservados.
    Para cancelar esta inspeção, entre em contato conosco pelo telefone ${contactPhone}.
  `;

  return { subject, htmlContent, textContent };
}

serve(handler);
