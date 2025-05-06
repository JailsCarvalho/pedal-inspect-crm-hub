
import { Customer, Inspection, SalesData, NotificationItem } from "../types";

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "912345678",
    birthdate: "1985-06-15",
    address: "Rua das Flores 123, Lisboa",
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "931234567",
    birthdate: "1990-03-22",
    address: "Av. da Liberdade 45, Porto",
    createdAt: "2023-02-20",
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro.costa@email.com",
    phone: "961234567",
    birthdate: "1978-11-05",
    address: "Rua do Comércio 67, Braga",
    createdAt: "2023-03-10",
  },
  {
    id: "4",
    name: "Ana Ferreira",
    email: "ana.ferreira@email.com",
    phone: "917654321",
    birthdate: "1982-09-30",
    address: "Praça da Alegria 12, Coimbra",
    createdAt: "2023-04-05",
  },
  {
    id: "5",
    name: "Rui Oliveira",
    email: "rui.oliveira@email.com",
    phone: "926543210",
    birthdate: "1995-12-12",
    address: "Rua dos Clérigos 89, Porto",
    createdAt: "2023-05-18",
  },
];

// Mock Inspections
export const mockInspections: Inspection[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "João Silva",
    bikeModel: "Scott Scale 970",
    bikeSerialNumber: "SC97023451",
    date: "2024-04-20",
    nextInspectionDate: "2025-04-20",
    status: "completed",
    notes: "Troca de pastilhas de travão, ajuste de mudanças",
    inspectionValue: 45,  // Added inspection value
  },
  {
    id: "2",
    customerId: "2",
    customerName: "Maria Santos",
    bikeModel: "Trek Marlin 7",
    bikeSerialNumber: "TM7123456",
    date: "2024-05-01",
    nextInspectionDate: "2025-05-01",
    status: "completed",
    notes: "Revisão completa, substituição de corrente",
    inspectionValue: 60,  // Added inspection value
  },
  {
    id: "3",
    customerId: "3",
    customerName: "Pedro Costa",
    bikeModel: "Specialized Rockhopper",
    bikeSerialNumber: "SR78901234",
    date: "2024-05-10",
    nextInspectionDate: "2025-05-10",
    status: "scheduled",
    inspectionValue: 35,  // Added inspection value
  },
  {
    id: "4",
    customerId: "4",
    customerName: "Ana Ferreira",
    bikeModel: "Cube Attention",
    bikeSerialNumber: "CA45678901",
    date: "2023-06-15",
    nextInspectionDate: "2024-06-15",
    status: "pending",
    notes: "Cliente precisa ser contactado para agendar",
  },
  {
    id: "5",
    customerId: "1",
    customerName: "João Silva",
    bikeModel: "Canyon Exceed",
    bikeSerialNumber: "CE12345678",
    date: "2023-11-03",
    nextInspectionDate: "2024-11-03",
    status: "pending",
  },
];

// We're removing the mock sales data since we'll be using real inspection data

// Mock Notifications
export const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Inspeção a vencer",
    message: "João Silva tem inspeção a vencer em 7 dias",
    type: "inspection",
    read: false,
    date: "2024-05-05T09:30:00",
  },
  {
    id: "2",
    title: "Aniversário",
    message: "Ana Ferreira faz aniversário hoje!",
    type: "birthday",
    read: false,
    date: "2024-05-05T08:00:00",
  },
  {
    id: "3",
    title: "Inspeção pendente",
    message: "Pedro Costa precisa agendar inspeção",
    type: "inspection",
    read: true,
    date: "2024-05-04T14:45:00",
  },
  {
    id: "4",
    title: "Sistema atualizado",
    message: "O sistema foi atualizado para a versão 1.2.0",
    type: "system",
    read: true,
    date: "2024-05-03T16:20:00",
  },
];
