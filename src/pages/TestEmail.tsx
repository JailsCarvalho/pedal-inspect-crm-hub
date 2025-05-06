
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationService } from "@/services/NotificationService";
import { Loader2, Send } from "lucide-react";

const TestEmail = () => {
  const [email, setEmail] = useState('jailson@iamsocial.pt');
  const [isSending, setIsSending] = useState(false);
  
  const handleSendTest = async () => {
    if (!email) return;
    
    setIsSending(true);
    
    try {
      await NotificationService.sendTestEmail(email);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Teste de Email</h1>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Enviar Email de Teste</CardTitle>
          <CardDescription>
            Use este formulário para enviar um email de teste e verificar se o sistema de notificações está funcionando corretamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Endereço de Email</label>
              <Input 
                type="email" 
                placeholder="email@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSendTest} 
            disabled={isSending || !email}
            className="ml-auto"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Teste
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestEmail;
