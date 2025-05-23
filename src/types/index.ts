
export interface Customer {
  id: string;
  name: string;
  taxId?: string;
  email: string;
  phone: string;
  birthdate: string;
  address: string;
  notes?: string;
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
  inspectionValue?: number;
  laborCost?: number;
  invoiceFile?: string;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  productName: string;
  bikeModel?: string;
  bikeSerialNumber?: string;
  price: number;
  date: string;
  notes?: string;
  invoiceFile?: string;
}

export interface SalesData {
  month: string;
  inspections: number;
  sales: number;
  inspectionValue?: number;
  salesCount?: number;
}

export type NotificationType = "inspection" | "birthday" | "system";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: string;
  customer_id?: string;
}
