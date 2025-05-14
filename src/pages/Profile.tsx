
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const PROFILE_KEY = "user_profile";

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });
  
  // Load saved profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          ...parsedProfile,
          // Always prioritize authenticated user data
          name: user?.name || parsedProfile.name || "",
          email: user?.email || parsedProfile.email || "",
        }));
      } catch (error) {
        console.error("Error loading saved profile:", error);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile data to localStorage
    localStorage.setItem(PROFILE_KEY, JSON.stringify(formData));
    
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
  };

  const activities = [
    {
      action: "Login efetuado",
      date: new Date(Date.now() - 1 * 86400000) // 1 day ago
    },
    {
      action: "Perfil atualizado",
      date: new Date(Date.now() - 2 * 86400000) // 2 days ago
    },
    {
      action: "Configurações alteradas",
      date: new Date(Date.now() - 3 * 86400000) // 3 days ago
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="" alt={formData.name || "Usuário"} />
              <AvatarFallback className="text-xl bg-ambikes-orange text-white">
                {formData.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="mb-4">Alterar foto</Button>
            
            <form onSubmit={handleSaveProfile} className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  readOnly 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                />
              </div>
              
              <Button type="submit" className="w-full">Salvar alterações</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Histórico de atividades na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div key={i} className="border-b pb-3">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.date.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
