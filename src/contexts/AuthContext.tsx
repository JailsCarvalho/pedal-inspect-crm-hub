
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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
    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          return;
        }

        if (session) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || ''
          };
          
          setUser(userData);
          localStorage.setItem('ambikes-user', JSON.stringify(userData));
        } else {
          // Check local storage as fallback
          const storedUser = localStorage.getItem('ambikes-user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || ''
          };
          
          setUser(userData);
          localStorage.setItem('ambikes-user', JSON.stringify(userData));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('ambikes-user');
        }
      }
    );

    getSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // If Supabase auth fails, try demo login
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
        throw error;
      }
      
      if (data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email || ''
        };
        
        setUser(userData);
        localStorage.setItem('ambikes-user', JSON.stringify(userData));
        toast.success('Login bem-sucedido!');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Erro ao fazer login: ${error.message || 'Verifique suas credenciais'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      localStorage.removeItem('ambikes-user');
      toast.info('Sessão encerrada');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Erro ao encerrar sessão');
    }
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
