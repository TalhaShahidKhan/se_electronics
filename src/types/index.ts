export type UrlConfig =
  | { type: "registration"; params: { token: string } }
  | { type: "feedback"; params: { serviceId: string } }
  | { type: "application-tracking"; params: { trackingId: string } }
  | { type: "service-tracking"; params: { trackingId: string } }
  | { type: "service-report"; params: { serviceId: string } }
  | { type: "invoice-download"; params: { token: string } }
  | { type: "id-card-download"; params: { token: string } }
  | { type: "certificate-download"; params: { token: string } }
  | { type: "customer-login"; params?: {} };

export type ProductTypes = "ips" | "battery" | "stabilizer" | "others";
export type ApplicationTypes =
  | "service_application"
  | "staff_application"
  | "subscription_application";
export type DocType = "invoice" | "payment" | "id-card" | "certificate";

export type CertificateData = {
  staffId: string;
  memberNumber: string;
  shopName: string;
  shopId: string;
  ownerName: string;
  phone: string;
  address: string;
  district: string;
};

export type SearchParams = { query?: string; page?: string; limit?: string };

export type CustomerData = {
  name: string;
  id: string;
  customerId: string;
  phone: string;
  address: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
  invoice: InvoicesType;
};

export type Product = {
  id: string;
  type: "ips" | "battery" | "stabilizer" | "others";
  invoiceId: string;
  model: string;
  quantity: number;
  unitPrice: number;
  warrantyStartDate: Date;
  warrantyDurationMonths: number;
};

export type FormState =
  | {
      success: boolean;
      message?: string;
    }
  | undefined;

export type Address = {
  address: string;
  district: string;
  policeStation: string;
  postOffice: string;
};

export type BankInfo = {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchName: string;
};

export type StaffsType = {
  name: string;
  fatherName: string;
  currentStreetAddress: string;
  currentDistrict: string;
  currentPoliceStation: string | null;
  currentPostOffice: string | null;
  permanentStreetAddress: string;
  permanentDistrict: string;
  permanentPoliceStation: string | null;
  permanentPostOffice: string | null;
  hasInstallationExperience: boolean;
  installationExperienceYears: number | null;
  isVerified: boolean;
  paymentPreference: PaymentTypes;
  walletNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  role: "technician" | "electrician";
  staffId: string;
  phone: string;
  photoKey: string;
  photoUrl: string;
  nidFrontPhotoKey: string;
  nidFrontPhotoUrl: string;
  nidBackPhotoKey: string;
  nidBackPhotoUrl: string;
  hasRepairExperience: boolean;
  repairExperienceYears: number | null;
  bankInfo: BankInfo | null;
  createdFrom: "public_form" | "dashboard";
  ipAddress: string | null;
  userAgent: string | null;
  docs: string | null;
  skills: string | null;
  bio: string | null;
  profileCompleted: boolean;
  rating: number | null;
  totalServices: number | null;
  successfulServices: number | null;
  canceledServices: number | null;
  isActiveStaff: boolean | null;
};

export type StaffServiveReport = {
  resolved: boolean;
  explanation?: string;
  travelCost?: number;
  reason?: string;
};

export type ServicesType = {
  id: string;
  serviceId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerAddressDistrict: string | null;
  customerAddressPoliceStation: string | null;
  customerAddressPostOffice: string | null;
  staffId: string | null;
  staffRole: "technician" | "electrician" | null;
  staffName: string | null;
  staffPhone: string | null;
  staffReport: StaffServiveReport | null;
  type: "install" | "repair";
  statusHistory: {
    customNote: string | null;
    customLabel: string | null;
    cancelReason: string | null;
    id: string;
    status: Statuses;
    statusType: "system" | "custom";
  }[];
  productType: ProductTypes;
  productModel: string;
  ipsBrand: string | null;
  productFrontPhotoKey: string | null;
  productBackPhotoKey: string | null;
  warrantyCardPhotoKey: string | null;
  powerRating: string | null;
  memoNumber: string | null;
  reportedIssue: string | null;
  createdFrom: "public_form" | "dashboard";
  isActive: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InvoicesType = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  paymentType: PaymentTypes;
  subtotal: number;
  total: number;
  dueAmount: number;
  customerPhone: string;
  products?: Product[];
};

export type PaymentDataType = {
  createdAt: Date;
  updatedAt: Date;
  id: string;
  date: Date;
  paymentId: string;
  invoiceNumber: string;
  paymentMethod: PaymentTypes;
  senderWalletNumber: string | null;
  receiverWalletNumber: string | null;
  transactionId: string | null;
  amount: number;
  description: string | null;
  staffId: string;
  staff?: StaffsType;
  senderBankInfo: BankInfo | null;
  receiverBankInfo: BankInfo | null;
};

export type Feedback = {
  question: string;
  answer: string;
  amount?: number;
  comment?: string;
};

export type FeedbackDataType = {
  id: string;
  customerId: string | null;
  serviceId: string;
  feedbacks: Feedback[] | null;
  rating: number | null;
  service: {
    productType: ProductTypes;
    customerId: string | null;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    staffId: string | null;
    staffName: string | null;
    staffPhone: string | null;
    type: "install" | "repair" | null;
    productModel: string;
  };
};

export type PaymentTypes = "cash" | "bkash" | "nagad" | "rocket" | "bank";

export type ServiceInfo = {
  serviceId: string;
  serviceType: string;
  customerId: string;
  customerName: string;
  customerPhoneNumber: string;
  customerAddress: string;
  productModel: string;
  technicianName: string;
  technicianPhoneNumber: string;
};

export type Statuses =
  | "pending"
  | "in_progress"
  | "appointment_retry"
  | "service_center"
  | "completed"
  | "canceled"
  | "processing"
  | "approved"
  | "rejected"
  | "valid"
  | "expired"
  | "staff_arrived"
  | "staff_departed"
  | "service_center_received";

export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export type StarRatingProps = {
  value?: number | null;
  onChange?: (rating: number) => void;
  totalStars?: number;
  size?: number;
  readonly?: boolean;
  allowHalfStars?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  hoverColor?: string;
  className?: string;
  showValue?: boolean;
  name?: string;
};
