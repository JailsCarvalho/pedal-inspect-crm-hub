
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    birthdayReminders: true,
    inspectionReminders: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    compactView: false,
  });

  const handleNotificationChange = (id: string, checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleAppearanceChange = (id: string, checked: boolean) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the settings
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Configure suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações de inspeções agendadas
                  </p>
                </div>
                <Switch 
                  id="emailNotifications" 
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="birthdayReminders">Lembretes de Aniversário</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes sobre aniversários de clientes
                  </p>
                </div>
                <Switch 
                  id="birthdayReminders" 
                  checked={notificationSettings.birthdayReminders}
                  onCheckedChange={(checked) => handleNotificationChange("birthdayReminders", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inspectionReminders">Lembretes de Inspeções</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes sobre inspeções próximas
                  </p>
                </div>
                <Switch 
                  id="inspectionReminders" 
                  checked={notificationSettings.inspectionReminders}
                  onCheckedChange={(checked) => handleNotificationChange("inspectionReminders", checked)}
                />
              </div>
              
              <Button type="submit">Salvar configurações</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Configure o visual da aplicação</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Alterar para o tema escuro
                  </p>
                </div>
                <Switch 
                  id="darkMode" 
                  checked={appearanceSettings.darkMode}
                  onCheckedChange={(checked) => handleAppearanceChange("darkMode", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compactView">Visualização Compacta</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar mais informações por tela
                  </p>
                </div>
                <Switch 
                  id="compactView" 
                  checked={appearanceSettings.compactView}
                  onCheckedChange={(checked) => handleAppearanceChange("compactView", checked)}
                />
              </div>
              
              <Button type="submit">Salvar configurações</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
