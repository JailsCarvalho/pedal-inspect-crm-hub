
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
  inspectionValue?: number;  // Added inspection value field
}

export interface SalesData {
  month: string;
  inspections: number;
  sales: number;
}

export type NotificationType = "inspection" | "birthday" | "system";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: string;
  customer_id?: string; // Added customer_id field
}
