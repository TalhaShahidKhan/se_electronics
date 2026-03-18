import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  pgEnum,
  uuid,
  json,
  index,
} from "drizzle-orm/pg-core";

export const productTypeEnum = pgEnum("productType", [
  "ips",
  "battery",
  "stabilizer",
  "others",
]);
export const paymentTypesEnum = pgEnum("paymentTypes", [
  "cash",
  "bkash",
  "nagad",
  "rocket",
  "bank",
]);
export const serviceTypeEnum = pgEnum("serviceType", ["install", "repair"]);
export const serviceStatusEnum = pgEnum("serviceStatus", [
  "requested",
  "pending",
  "in_progress",
  "appointment_retry",
  "service_center",
  "completed",
  "canceled",
  "staff_arrived",
  "staff_departed",
  "service_center_received",
]);
export const staffRoleEnum = pgEnum("staffRole", ["technician", "electrician"]);
export const createdFromTypesEnum = pgEnum("createdFromTypes", [
  "public_form",
  "dashboard",
]);
export const statusTypesEnum = pgEnum("statusTypes", ["system", "custom"]);
export const applicationTypesEnum = pgEnum("applicationTypes", [
  "service_application",
  "staff_application",
  "subscription_application",
]);
export const docTypesEnum = pgEnum("docTypes", [
  "invoice",
  "payment",
  "id-card",
  "certificate",
  "complaint",
  "hearing-notice",
  "completion-notice",
]);
export const subscriptionTypesEnum = pgEnum("subscriptionTypes", [
  "monthly",
  "yearly",
]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "processing",
  "approved",
  "rejected",
  "credited",
]);
export const noticePriorityEnum = pgEnum("noticePriority", [
  "low",
  "normal",
  "high",
  "urgent",
]);
export const noticeTargetEnum = pgEnum("noticeTarget", [
  "single",
  "multiple",
  "all",
]);
export const taskStatusEnum = pgEnum("taskStatus", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const smsFrequencyEnum = pgEnum("smsFrequency", [
  "immediate",
  "daily_digest",
]);

export const smsLogStatusEnum = pgEnum("smsLogStatus", ["sent", "failed"]);

export const admins = pgTable("admins", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: text().notNull(),
  role: varchar("role", { length: 50 }).default("admin").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const customers = pgTable(
  "customers",
  {
    id: uuid().defaultRandom().primaryKey(),
    customerId: varchar("customerId", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 255 }).notNull(),
    address: text().notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customer_id_idx").on(table.customerId),
    index("customer_phone_idx").on(table.phone),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid().defaultRandom().primaryKey(),
    type: productTypeEnum("type").notNull(),
    invoiceId: varchar("invoiceId", { length: 255 })
      .references(() => invoices.invoiceNumber, { onDelete: "cascade" })
      .notNull(),
    model: varchar("model", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unitPrice").notNull(),
    warrantyStartDate: timestamp("warrantyStartDate", {
      withTimezone: true,
    }).notNull(),
    warrantyDurationMonths: integer("warrantyDurationMonths").notNull(),
  },
  (table) => [index("product_invoice_id_idx").on(table.invoiceId)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().defaultRandom().primaryKey(),
    invoiceNumber: varchar("invoiceNumber", { length: 255 }).unique().notNull(),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerAddress: text().notNull(),
    customerId: varchar("customerId", { length: 255 })
      .references(() => customers.customerId, { onDelete: "cascade" })
      .notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    paymentType: paymentTypesEnum("paymentType").notNull(),
    subtotal: integer("subtotal").notNull(),
    total: integer("total").notNull(),
    dueAmount: integer("dueAmount").notNull(),
    customerPhone: varchar("customerPhone", { length: 255 }).notNull(),
  },
  (table) => [index("invoice_number_idx").on(table.invoiceNumber)],
);

export const staffs = pgTable(
  "staffs",
  {
    id: uuid().defaultRandom().primaryKey(),
    staffId: varchar("staffId", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    fatherName: varchar("fatherName", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 255 }).unique().notNull(),
    role: staffRoleEnum("role").notNull(),
    currentStreetAddress: text().notNull(),
    currentDistrict: varchar("currentDistrict", { length: 255 }).notNull(),
    currentPoliceStation: varchar("currentPoliceStation", { length: 255 }),
    currentPostOffice: varchar("currentPostOffice", { length: 255 }),
    permanentStreetAddress: text().notNull(),
    permanentDistrict: varchar("permanentDistrict", { length: 255 }).notNull(),
    permanentPoliceStation: varchar("permanentPoliceStation", { length: 255 }),
    permanentPostOffice: varchar("permanentPostOffice", { length: 255 }),
    photoKey: text().notNull(),
    nidFrontPhotoKey: text().notNull(),
    nidBackPhotoKey: text().notNull(),
    hasRepairExperience: boolean("hasRepairExperience").notNull(),
    repairExperienceYears: integer("repairExperienceYears"),
    hasInstallationExperience: boolean("hasInstallationExperience").notNull(),
    installationExperienceYears: integer("installationExperienceYears"),
    isVerified: boolean("isVerified").default(false).notNull(),
    paymentPreference: paymentTypesEnum("paymentPreference").notNull(),
    walletNumber: varchar("walletNumber", { length: 255 }),
    bankInfo: json("bankInfo"),
    docs: json("docs"),
    skills: json("skills"),
    bio: text("bio"),
    profileCompleted: boolean("profileCompleted").default(false).notNull(),
    rating: integer("rating"),
    totalServices: integer("totalServices"),
    successfulServices: integer("successfulServices"),
    canceledServices: integer("canceledServices"),
    isActiveStaff: boolean("isActiveStaff").default(true),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdFrom: createdFromTypesEnum("createdFrom").notNull(),
    smsNotificationEnabled: boolean("smsNotificationEnabled")
      .default(true)
      .notNull(),
    smsWorkingHoursOnly: boolean("smsWorkingHoursOnly").default(true).notNull(),
    smsFrequency: smsFrequencyEnum("smsFrequency").default("immediate").notNull(),
    smsOptOut: boolean("smsOptOut").default(false).notNull(),
    ipAddress: varchar("ipAddress", { length: 255 }),
    userAgent: text("userAgent"),
  },
  (table) => [
    index("staff_id_idx").on(table.staffId),
    index("staff_phone_idx").on(table.phone),
    index("staff_role_idx").on(table.role),
  ],
);

export const services = pgTable(
  "services",
  {
    id: uuid().defaultRandom().primaryKey(),
    serviceId: varchar("serviceId", { length: 255 }).unique().notNull(),
    customerId: varchar("customerId", { length: 255 }),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerPhone: varchar("customerPhone", { length: 255 }).notNull(),
    customerAddress: text().notNull(),
    customerAddressDistrict: varchar("customerAddressDistrict", {
      length: 255,
    }),
    customerAddressPoliceStation: varchar("customerAddressPoliceStation", {
      length: 255,
    }),
    customerAddressPostOffice: varchar("customerAddressPostOffice", {
      length: 255,
    }),
    staffId: varchar("staffId", { length: 255 }),
    staffRole: staffRoleEnum("staffRole"),
    staffName: varchar("staffName", { length: 255 }),
    staffPhone: varchar("staffPhone", { length: 255 }),
    staffReport: json("staffReport"),
    type: serviceTypeEnum("type").notNull(),
    statusHistory: json("statusHistory").notNull(),
    productType: productTypeEnum("productType").notNull(),
    productModel: varchar("productModel", { length: 255 }).notNull(),
    ipsBrand: varchar("ipsBrand", { length: 255 }),
    productFrontPhotoKey: text("productFrontPhotoKey"),
    productBackPhotoKey: text("productBackPhotoKey"),
    warrantyCardPhotoKey: text("warrantyCardPhotoKey"),
    powerRating: varchar("powerRating", { length: 255 }),
    memoNumber: varchar("memoNumber", { length: 255 }),
    reportedIssue: text("reportedIssue"),
    createdFrom: createdFromTypesEnum("createdFrom").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    ipAddress: varchar("ipAddress", { length: 255 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("service_id_idx").on(table.serviceId),
    index("service_staff_id_idx").on(table.staffId),
    index("service_customer_id_idx").on(table.customerId),
  ],
);

export const feedbacks = pgTable(
  "feedbacks",
  {
    id: uuid().defaultRandom().primaryKey(),
    customerId: varchar("customerId", { length: 255 }),
    serviceId: varchar("serviceId", { length: 255 })
      .references(() => services.serviceId, { onDelete: "cascade" })
      .notNull(),
    feedbacks: json("feedbacks"),
    rating: integer("rating"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("feedback_service_id_idx").on(table.serviceId),
    index("feedback_customer_id_idx").on(table.customerId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid().defaultRandom().primaryKey(),
    paymentId: varchar("paymentId", { length: 255 }).unique().notNull(),
    invoiceNumber: varchar("invoiceNumber", { length: 255 }),
    serviceId: varchar("serviceId", { length: 255 }),
    staffId: varchar("staffId", { length: 255 })
      .references(() => staffs.staffId, { onDelete: "cascade" })
      .notNull(),
    paymentMethod: paymentTypesEnum("paymentMethod").notNull(),
    senderWalletNumber: varchar("senderWalletNumber", { length: 255 }),
    receiverWalletNumber: varchar("receiverWalletNumber", { length: 255 }),
    transactionId: varchar("transactionId", { length: 255 }),
    senderBankInfo: json("senderBankInfo"),
    receiverBankInfo: json("receiverBankInfo"),
    amount: integer("amount").notNull(),
    description: text("description"),
    status: paymentStatusEnum("status").notNull(),
    statusHistory: json("statusHistory"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payment_id_idx").on(table.paymentId),
    index("payment_staff_id_idx").on(table.staffId),
    index("payment_invoice_number_idx").on(table.invoiceNumber),
  ],
);

export const applications = pgTable(
  "applications",
  {
    id: uuid().defaultRandom().primaryKey(),
    applicationId: varchar("applicationId", { length: 255 }).unique().notNull(),
    applicantId: varchar("applicantId", { length: 255 }).notNull(),
    type: applicationTypesEnum("type").notNull(),
    status: serviceStatusEnum("status").default("pending").notNull(),
    statusHistory: json("statusHistory"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("application_id_idx").on(table.applicationId),
    index("application_applicant_id_idx").on(table.applicantId),
  ],
);

export const authTokens = pgTable(
  "authTokens",
  {
    id: uuid().defaultRandom().primaryKey(),
    token: varchar("token", { length: 255 }).unique().notNull(),
    docType: docTypesEnum("docType").notNull(),
    docId: varchar("docId", { length: 255 }).notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    isValid: boolean("isValid").default(true).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("auth_token_idx").on(table.token)],
);

export const agreements = pgTable("agreements", {
  id: uuid().defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text().notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const userAgreements = pgTable(
  "userAgreements",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    agreementId: uuid("agreementId")
      .references(() => agreements.id, { onDelete: "cascade" })
      .notNull(),
    ipAddress: varchar("ipAddress", { length: 255 }).notNull(),
    userAgent: text("userAgent").notNull(),
    agreedAt: timestamp("agreedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("user_agreement_user_id_idx").on(table.userId)],
);

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid().defaultRandom().primaryKey(),
    subscriptionId: varchar("subscriptionId", { length: 255 })
      .unique()
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 255 }).notNull(),
    streetAddress: text().notNull(),
    district: varchar("district", { length: 255 }).notNull(),
    policeStation: varchar("policeStation", { length: 255 }).notNull(),
    postOffice: varchar("postOffice", { length: 255 }).notNull(),
    subscriptionDuration: integer("subscriptionDuration").notNull(),
    subscriptionType: subscriptionTypesEnum("subscriptionType").notNull(),
    batteryType: varchar("batteryType", { length: 255 }).notNull(),
    ipsBrand: varchar("ipsBrand", { length: 255 }),
    ipsPowerRating: varchar("ipsPowerRating", { length: 255 }),
    paymentType: paymentTypesEnum("paymentType").notNull(),
    walletNumber: varchar("walletNumber", { length: 255 }),
    transactionId: varchar("transactionId", { length: 255 }),
    bankName: varchar("bankName", { length: 255 }),
    accountHolderName: varchar("accountHolderName", { length: 255 }),
    accountNumber: varchar("accountNumber", { length: 255 }),
    branchName: varchar("branchName", { length: 255 }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("subscriber_id_idx").on(table.subscriptionId),
    index("subscriber_phone_idx").on(table.phone),
  ],
);

export const notices = pgTable(
  "notices",
  {
    id: uuid().defaultRandom().primaryKey(),
    noticeId: varchar("noticeId", { length: 255 }).unique().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text().notNull(),
    priority: noticePriorityEnum("priority").default("normal").notNull(),
    targetType: noticeTargetEnum("targetType").default("all").notNull(),
    isDraft: boolean("isDraft").default(false).notNull(),
    scheduledAt: timestamp("scheduledAt", { withTimezone: true }),
    expiresAt: timestamp("expiresAt", { withTimezone: true }),
    createdBy: varchar("createdBy", { length: 255 }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("notice_id_idx").on(table.noticeId)],
);

export const noticeRecipients = pgTable(
  "noticeRecipients",
  {
    id: uuid().defaultRandom().primaryKey(),
    noticeId: varchar("noticeId", { length: 255 })
      .references(() => notices.noticeId, { onDelete: "cascade" })
      .notNull(),
    staffId: varchar("staffId", { length: 255 })
      .references(() => staffs.staffId, { onDelete: "cascade" })
      .notNull(),
    isRead: boolean("isRead").default(false).notNull(),
    readAt: timestamp("readAt", { withTimezone: true }),
    isAcknowledged: boolean("isAcknowledged").default(false).notNull(),
    acknowledgedAt: timestamp("acknowledgedAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notice_recipient_notice_id_idx").on(table.noticeId),
    index("notice_recipient_staff_id_idx").on(table.staffId),
  ],
);

export const staffNotifications = pgTable(
  "staffNotifications",
  {
    id: uuid().defaultRandom().primaryKey(),
    staffId: varchar("staffId", { length: 255 })
      .references(() => staffs.staffId, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    message: text().notNull(),
    link: text("link"),
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("staff_notification_staff_id_idx").on(table.staffId)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid().defaultRandom().primaryKey(),
    taskId: varchar("taskId", { length: 255 }).unique().notNull(),
    staffId: varchar("staffId", { length: 255 })
      .references(() => staffs.staffId, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text().notNull(),
    priority: noticePriorityEnum("priority").default("normal").notNull(),
    dueDate: timestamp("dueDate", { withTimezone: true }),
    status: taskStatusEnum("status").default("pending").notNull(),
    files: json("files").$type<string[]>(),
    comments: json("comments").$type<any[]>(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("task_id_idx").on(table.taskId),
    index("task_staff_id_idx").on(table.staffId),
    index("task_status_idx").on(table.status),
    index("task_priority_idx").on(table.priority),
  ],
);

export const smsLogs = pgTable(
  "smsLogs",
  {
    id: uuid().defaultRandom().primaryKey(),
    staffId: varchar("staffId", { length: 255 }).references(() => staffs.staffId, {
      onDelete: "set null",
    }),
    phoneNumber: varchar("phoneNumber", { length: 255 }).notNull(),
    message: text("message").notNull(),
    status: smsLogStatusEnum("status").notNull(),
    error: text("error"),
    carrier: varchar("carrier", { length: 255 }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sms_log_staff_id_idx").on(table.staffId),
    index("sms_log_status_idx").on(table.status),
  ],
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  staff: one(staffs, {
    fields: [tasks.staffId],
    references: [staffs.staffId],
  }),
}));

export const smsLogsRelations = relations(smsLogs, ({ one }) => ({
  staff: one(staffs, {
    fields: [smsLogs.staffId],
    references: [staffs.staffId],
  }),
}));

export const staffNotificationsRelations = relations(
  staffNotifications,
  ({ one }) => ({
    staff: one(staffs, {
      fields: [staffNotifications.staffId],
      references: [staffs.staffId],
    }),
  }),
);

export const noticeRecipientsRelations = relations(
  noticeRecipients,
  ({ one }) => ({
    notice: one(notices, {
      fields: [noticeRecipients.noticeId],
      references: [notices.noticeId],
    }),
    staff: one(staffs, {
      fields: [noticeRecipients.staffId],
      references: [staffs.staffId],
    }),
  }),
);

export const noticesRelations = relations(notices, ({ many }) => ({
  recipients: many(noticeRecipients),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
  services: many(services),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.customerId],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  invoice: one(invoices, {
    fields: [products.invoiceId],
    references: [invoices.invoiceNumber],
  }),
}));

export const staffsRelations = relations(staffs, ({ many, one }) => ({
  services: many(services),
  payments: many(payments),
  agreements: many(userAgreements),
  notifications: many(staffNotifications),
  tasks: many(tasks),
  smsLogs: many(smsLogs),
  application: one(applications, {
    fields: [staffs.id],
    references: [applications.applicantId],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  staff: one(staffs, {
    fields: [services.staffId],
    references: [staffs.staffId],
  }),
  customer: one(customers, {
    fields: [services.customerId],
    references: [customers.customerId],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  staff: one(staffs, {
    fields: [payments.staffId],
    references: [staffs.staffId],
  }),
  service: one(services, {
    fields: [payments.serviceId],
    references: [services.serviceId],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  staff: one(staffs, {
    fields: [applications.applicantId],
    references: [staffs.id],
  }),
}));

export const userAgreementsRelations = relations(userAgreements, ({ one }) => ({
  agreement: one(agreements, {
    fields: [userAgreements.agreementId],
    references: [agreements.id],
  }),
  staff: one(staffs, {
    fields: [userAgreements.userId],
    references: [staffs.staffId],
  }),
}));
