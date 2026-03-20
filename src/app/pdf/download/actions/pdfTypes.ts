import { BankInfo, InvoicesType, PaymentTypes, StaffsType, Statuses } from "@/types";

export type PayoutPreference = "bkash" | "nagad" | "rocket" | "bank";

export interface InvoiceTemplateData extends InvoicesType {
  bgImage: string;
}

export interface PaymentReceiptTemplateData {
  bgImage: string;
  invoiceNumber: string;
  date: Date;
  description: string | null;
  staffId: string;
  transactionId: string | null;
  paymentId: string;
  paymentMethod: PaymentTypes;
  senderWalletNumber: string | null;
  senderBankInfo: BankInfo | null;
  receiverWalletNumber: string | null;
  receiverBankInfo: BankInfo | null;
  amount: number;
  staff: {
    name: string;
  };
  serviceId?: string | null;
}

export interface IdCardTemplateData extends Omit<StaffsType, "role" | "photoUrl" | "currentPoliceStation" | "currentPostOffice"> {
  role: "technician" | "electrician";
  photoUrl: string;
  currentPoliceStation: string;
  currentPostOffice: string;
  frontBgImage: string;
  backBgImage: string;
  issueDate: Date;
  qrcode: string;
  barcode: string;
}

export interface CertificateTemplateData extends Omit<StaffsType, "role"> {
  role: "technician" | "electrician";
  bgImage: string;
  issueDate: Date;
}

export interface ComplaintTemplateData {
  complaintId: string;
  customer: {
    name: string;
    customerId: string;
    phone: string;
    address: string;
  };
  staff: {
    name: string;
    phone: string;
    role: string;
    staffId: string;
    currentStreetAddress?: string;
    currentDistrict?: string;
  };
  productType?: string;
  subject: string;
  description: string;
  status: string;
  adminNote?: string | null;
  createdAt: Date;
  logo?: string;
}

export interface HearingNoticeTemplateData {
  complaintId: string;
  customer: {
    name: string;
    customerId: string;
    phone: string;
    address: string;
  };
  staff: {
    name: string;
    phone: string;
    role: string;
    staffId: string;
  };
  subject: string;
  adminNote?: string | null;
  issueDateBn: string;
  receiptNum: string;
  logo?: string;
}

export interface CompletionNoticeTemplateData {
  complaintId: string;
  customer: {
    name: string;
    customerId: string;
    phone: string;
    address: string;
  };
  staff: {
    name: string;
    phone: string;
    role: string;
    staffId: string;
  };
  subject: string;
  adminNote?: string | null;
  resolvedDateBn: string;
  receiptNo: string;
  logo?: string;
}
