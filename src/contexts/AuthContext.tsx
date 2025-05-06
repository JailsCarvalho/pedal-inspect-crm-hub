
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for auth data
    const storedUser = localStorage.getItem('ambikes-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // For demo purposes, we're using hardcoded credentials
      // In a real app, this would be an API call
      if (email === 'admin@ambikes.pt' && password === 'admin') {
        const userData = {
          id: '1',
          name: 'Admin User',
          email: 'admin@ambikes.pt'
        };
        
        setUser(userData);
        localStorage.setItem('ambikes-user', JSON.stringify(userData));
        toast.success('Login bem-sucedido!');
        return;
      }
      throw new Error('Credenciais inválidas');
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ambikes-user');
    toast.info('Sessão encerrada');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
