
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  address: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  customerId: string;
  customerName: string;
  bikeModel: string;
  bikeSerialNumber: string;
  date: string;
  nextInspectionDate: string;
  status: "scheduled" | "completed" | "pending" | "cancelled";
  notes?: string;
}

export interface SalesData {
  month: string;
  inspections: number;
  sales: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "inspection" | "birthday" | "system" | "email";
  read: boolean;
  date: string;
}
