
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NotificationService } from "@/services/NotificationService";

const Index = () => {
  const [sentEmail, setSentEmail] = useState(false);

  // Send test email on component mount
  useEffect(() => {
    const sendTestEmail = async () => {
      if (!sentEmail) {
        await NotificationService.sendTestEmail('jailson@iamsocial.pt');
        setSentEmail(true);
      }
    };
    
    sendTestEmail();
  }, [sentEmail]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <h1 className="text-4xl font-bold mb-8 text-ambikes-orange">Bem-vindo à Ambikes</h1>
      <p className="text-xl mb-12">Sistema de Gestão para Oficinas de Bicicletas</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/dashboard" className="block p-8 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-gray-600">Visualize estatísticas e indicadores importantes.</p>
        </Link>
        
        <Link to="/clients" className="block p-8 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Clientes</h2>
          <p className="text-gray-600">Gerencie a base de clientes e seus dados.</p>
        </Link>
        
        <Link to="/inspections" className="block p-8 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Inspeções</h2>
          <p className="text-gray-600">Acompanhe inspeções agendadas e concluídas.</p>
        </Link>
        
        <Link to="/reports" className="block p-8 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Relatórios</h2>
          <p className="text-gray-600">Obtenha insights através de relatórios detalhados.</p>
        </Link>
        
        <Link to="/test-email" className="block p-8 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Teste de Email</h2>
          <p className="text-gray-600">Envie emails de teste para verificar o sistema de notificações.</p>
        </Link>
      </div>

      {sentEmail && (
        <div className="mt-8 p-4 bg-green-100 text-green-800 rounded-md">
          Um email de teste foi enviado para jailson@iamsocial.pt
        </div>
      )}
    </div>
  );
};

export default Index;
