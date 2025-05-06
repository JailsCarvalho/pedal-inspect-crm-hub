
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Bike, Calendar, ChartBar, Users } from "lucide-react";

const AppSidebar: React.FC = () => {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-6">
        <img src="/ambikes-logo.svg" alt="AMBikes Logo" className="h-10" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav className="space-y-1.5">
              <NavLink 
                to="/" 
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <ChartBar className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/clients" 
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <Users className="h-5 w-5" />
                <span>Clientes</span>
              </NavLink>
              <NavLink 
                to="/inspections" 
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <Bike className="h-5 w-5" />
                <span>Inspeções</span>
              </NavLink>
              <NavLink 
                to="/reports" 
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <ChartBar className="h-5 w-5" />
                <span>Relatórios</span>
              </NavLink>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
