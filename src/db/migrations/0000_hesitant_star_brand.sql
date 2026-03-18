CREATE TYPE "public"."agreementTypes" AS ENUM('application_declaration');--> statement-breakpoint
CREATE TYPE "public"."applicationStatus" AS ENUM('pending', 'processing', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."applicationTypes" AS ENUM('service_application', 'staff_application', 'subscription_application', 'vip_card_application');--> statement-breakpoint
CREATE TYPE "public"."serviceSourceTypes" AS ENUM('public_form', 'dashboard');--> statement-breakpoint
CREATE TYPE "public"."noticePriority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."noticeTarget" AS ENUM('single', 'multiple', 'all');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('requested', 'pending', 'processing', 'approved', 'rejected', 'completed', 'credited');--> statement-breakpoint
CREATE TYPE "public"."paymentTypes" AS ENUM('cash', 'bkash', 'nagad', 'rocket', 'bank');--> statement-breakpoint
CREATE TYPE "public"."productType" AS ENUM('ips', 'battery', 'stabilizer', 'others');--> statement-breakpoint
CREATE TYPE "public"."reportStatus" AS ENUM('pending', 'processing', 'resolved', 'dismissed', 'under_trial', 'hearing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."resolvedByTypes" AS ENUM('staff_member', 'service_center');--> statement-breakpoint
CREATE TYPE "public"."serviceStatus" AS ENUM('pending', 'in_progress', 'appointment_retry', 'staff_departed', 'staff_arrived', 'service_center', 'service_center_received', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."serviceType" AS ENUM('install', 'repair');--> statement-breakpoint
CREATE TYPE "public"."smsFrequency" AS ENUM('immediate', 'daily_digest');--> statement-breakpoint
CREATE TYPE "public"."smsLogStatus" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."staffRole" AS ENUM('technician', 'electrician');--> statement-breakpoint
CREATE TYPE "public"."statusTypes" AS ENUM('system', 'custom');--> statement-breakpoint
CREATE TYPE "public"."subscriptionTypes" AS ENUM('battery_maintenance', 'ips_and_battery_maintenance', 'full_maintenance');--> statement-breakpoint
CREATE TYPE "public"."taskStatus" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "adminNotifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(255),
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "agreementTypes" NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"version" varchar(10) DEFAULT '1.0',
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicationId" varchar(255) NOT NULL,
	"applicantId" varchar(255) NOT NULL,
	"status" "applicationStatus" DEFAULT 'pending' NOT NULL,
	"type" "applicationTypes" NOT NULL,
	"rejectReason" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_applicationId_unique" UNIQUE("applicationId"),
	CONSTRAINT "applications_applicantId_unique" UNIQUE("applicantId")
);
--> statement-breakpoint
CREATE TABLE "authTokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"payload" json,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "authTokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "contactMessages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"messageId" varchar(255) NOT NULL,
	"customerId" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"adminReply" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contactMessages_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "customerNotifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customerId" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(255),
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customerId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"invoiceNumber" varchar(255) NOT NULL,
	"isActiveCustomer" boolean DEFAULT true NOT NULL,
	"profileCompleted" boolean DEFAULT false NOT NULL,
	"vipCardNumber" varchar(16),
	"vipStatus" "applicationStatus" DEFAULT 'pending',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_customerId_unique" UNIQUE("customerId"),
	CONSTRAINT "customers_invoiceNumber_unique" UNIQUE("invoiceNumber"),
	CONSTRAINT "customers_vipCardNumber_unique" UNIQUE("vipCardNumber")
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serviceId" varchar(255) NOT NULL,
	"customerId" varchar(255),
	"feedbacks" json,
	"rating" double precision,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedbacks_serviceId_unique" UNIQUE("serviceId")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoiceNumber" varchar(255) NOT NULL,
	"customerId" varchar(255) NOT NULL,
	"customerName" varchar(255) NOT NULL,
	"customerPhone" varchar(255) NOT NULL,
	"customerAddress" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"paymentType" "paymentTypes" NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"dueAmount" numeric(12, 2) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "noticeRecipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"noticeId" uuid NOT NULL,
	"staffId" varchar(255),
	"customerId" varchar(255),
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp with time zone,
	"isAcknowledged" boolean DEFAULT false NOT NULL,
	"acknowledgedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"noticeId" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"priority" "noticePriority" DEFAULT 'normal' NOT NULL,
	"targetType" "noticeTarget" DEFAULT 'all' NOT NULL,
	"isDraft" boolean DEFAULT false NOT NULL,
	"scheduledAt" timestamp with time zone,
	"expiresAt" timestamp with time zone,
	"createdBy" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notices_noticeId_unique" UNIQUE("noticeId")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paymentId" varchar(255) NOT NULL,
	"staffId" varchar(255) NOT NULL,
	"invoiceNumber" varchar(255) NOT NULL,
	"paymentMethod" "paymentTypes" NOT NULL,
	"senderWalletNumber" varchar(255),
	"senderBankInfo" json,
	"receiverWalletNumber" varchar(255),
	"receiverBankInfo" json,
	"amount" numeric(12, 2) NOT NULL,
	"serviceId" varchar(255),
	"status" "paymentStatus" DEFAULT 'pending' NOT NULL,
	"transactionId" varchar(255),
	"description" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_paymentId_unique" UNIQUE("paymentId"),
	CONSTRAINT "payments_invoiceNumber_unique" UNIQUE("invoiceNumber"),
	CONSTRAINT "payments_transactionId_unique" UNIQUE("transactionId")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoiceId" uuid NOT NULL,
	"type" "productType" NOT NULL,
	"model" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"warrantyStartDate" timestamp with time zone NOT NULL,
	"warrantyDurationMonths" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serviceStatusHistory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serviceId" varchar(255) NOT NULL,
	"status" "serviceStatus",
	"statusType" "statusTypes" DEFAULT 'system' NOT NULL,
	"customLabel" varchar(255),
	"customNote" text,
	"cancelReason" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serviceId" varchar(255) NOT NULL,
	"customerId" varchar(255),
	"customerName" varchar(255) NOT NULL,
	"customerPhone" varchar(255) NOT NULL,
	"customerAddress" text NOT NULL,
	"customerAddressDistrict" varchar(255),
	"customerAddressPoliceStation" varchar(255),
	"customerAddressPostOffice" varchar(255),
	"staffId" varchar(255),
	"staffRole" "staffRole",
	"staffName" varchar(255),
	"staffPhone" varchar(255),
	"staffReport" json,
	"type" "serviceType" DEFAULT 'repair',
	"productType" "productType" NOT NULL,
	"productModel" varchar(255) NOT NULL,
	"ipsBrand" varchar(255),
	"productFrontPhotoKey" varchar(255),
	"productBackPhotoKey" varchar(255),
	"warrantyCardPhotoKey" varchar(255),
	"powerRating" varchar(255),
	"memoNumber" varchar(255),
	"reportedIssue" text,
	"createdFrom" "serviceSourceTypes" NOT NULL,
	"resolvedBy" "resolvedByTypes",
	"isActive" boolean DEFAULT false NOT NULL,
	"ipAddress" varchar(255),
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_serviceId_unique" UNIQUE("serviceId")
);
--> statement-breakpoint
CREATE TABLE "smsLogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staffId" varchar(255),
	"phoneNumber" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" "smsLogStatus" NOT NULL,
	"error" text,
	"carrier" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staffComplaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaintId" varchar(255) NOT NULL,
	"customerId" varchar(255) NOT NULL,
	"staffId" varchar(255) NOT NULL,
	"serviceId" varchar(255),
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"evidencePhotoKey" varchar(255),
	"status" "reportStatus" DEFAULT 'under_trial' NOT NULL,
	"adminNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staffComplaints_complaintId_unique" UNIQUE("complaintId")
);
--> statement-breakpoint
CREATE TABLE "staffNotifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staffId" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(255),
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staffId" varchar(255) NOT NULL,
	"username" varchar(255),
	"password" text,
	"name" varchar(255) NOT NULL,
	"fatherName" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"currentStreetAddress" text NOT NULL,
	"currentDistrict" varchar(100) NOT NULL,
	"currentPoliceStation" varchar(100),
	"currentPostOffice" varchar(100),
	"permanentStreetAddress" text NOT NULL,
	"permanentDistrict" varchar(100) NOT NULL,
	"permanentPoliceStation" varchar(100),
	"permanentPostOffice" varchar(100),
	"photoKey" varchar(255) NOT NULL,
	"nidFrontPhotoKey" varchar(255) NOT NULL,
	"nidBackPhotoKey" varchar(255) NOT NULL,
	"skills" text,
	"bio" text,
	"hasRepairExperience" boolean DEFAULT false NOT NULL,
	"repairExperienceYears" integer DEFAULT 0,
	"hasInstallationExperience" boolean DEFAULT false NOT NULL,
	"installationExperienceYears" integer DEFAULT 0,
	"role" "staffRole" NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isActiveStaff" boolean DEFAULT true NOT NULL,
	"profileCompleted" boolean DEFAULT false NOT NULL,
	"rating" numeric(3, 2) DEFAULT 0,
	"totalServices" integer DEFAULT 0,
	"successfulServices" integer DEFAULT 0,
	"canceledServices" integer DEFAULT 0,
	"paymentPreference" "paymentTypes" NOT NULL,
	"walletNumber" varchar(255),
	"bankInfo" json,
	"docs" text,
	"createdFrom" "serviceSourceTypes" NOT NULL,
	"smsNotificationEnabled" boolean DEFAULT true NOT NULL,
	"smsWorkingHoursOnly" boolean DEFAULT true NOT NULL,
	"smsFrequency" "smsFrequency" DEFAULT 'immediate' NOT NULL,
	"smsOptOut" boolean DEFAULT false NOT NULL,
	"ipAddress" varchar(255),
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staffs_staffId_unique" UNIQUE("staffId"),
	CONSTRAINT "staffs_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriptionId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"streetAddress" text NOT NULL,
	"district" varchar(100) NOT NULL,
	"policeStation" varchar(100),
	"postOffice" varchar(100),
	"subscriptionDuration" integer NOT NULL,
	"subscriptionType" "subscriptionTypes" NOT NULL,
	"batteryType" varchar(255) NOT NULL,
	"ipsBrand" varchar(255),
	"ipsPowerRating" varchar(255),
	"paymentType" "paymentTypes" NOT NULL,
	"basePrice" numeric(12, 2) NOT NULL,
	"discountAmount" numeric(10, 2) DEFAULT 0,
	"surchargeAmount" numeric(10, 2) DEFAULT 0,
	"totalFee" numeric(12, 2) NOT NULL,
	"walletNumber" varchar(255),
	"transactionId" varchar(255),
	"bankInfo" json,
	"isActive" boolean DEFAULT false NOT NULL,
	"ipAddress" varchar(255) NOT NULL,
	"userAgent" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_subscriptionId_unique" UNIQUE("subscriptionId")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" varchar(255) NOT NULL,
	"staffId" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"priority" "noticePriority" DEFAULT 'normal' NOT NULL,
	"dueDate" timestamp with time zone,
	"status" "taskStatus" DEFAULT 'pending' NOT NULL,
	"files" json,
	"comments" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_taskId_unique" UNIQUE("taskId")
);
--> statement-breakpoint
CREATE TABLE "userAgreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"agreementId" uuid NOT NULL,
	"agreedAt" timestamp with time zone DEFAULT now(),
	"ipAddress" varchar(255) NOT NULL,
	"userAgent" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contactMessages" ADD CONSTRAINT "contactMessages_customerId_customers_customerId_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("customerId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customerNotifications" ADD CONSTRAINT "customerNotifications_customerId_customers_customerId_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("customerId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_serviceId_services_serviceId_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("serviceId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_customerId_customers_customerId_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("customerId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_customers_customerId_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("customerId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noticeRecipients" ADD CONSTRAINT "noticeRecipients_noticeId_notices_id_fk" FOREIGN KEY ("noticeId") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noticeRecipients" ADD CONSTRAINT "noticeRecipients_staffId_staffs_staffId_fk" FOREIGN KEY ("staffId") REFERENCES "public"."staffs"("staffId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noticeRecipients" ADD CONSTRAINT "noticeRecipients_customerId_customers_customerId_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("customerId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_createdBy_admins_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_staffId_staffs_staffId_fk" FOREIGN KEY ("staffId") REFERENCES "public"."staffs"("staffId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_serviceId_services_serviceId_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("serviceId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_invoiceId_invoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serviceStatusHistory" ADD CONSTRAINT "serviceStatusHistory_serviceId_services_serviceId_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("serviceId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_customerId_customers_customerId_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("customerId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_staffId_staffs_staffId_fk" FOREIGN KEY ("staffId") REFERENCES "public"."staffs"("staffId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smsLogs" ADD CONSTRAINT "smsLogs_staffId_staffs_staffId_fk" FOREIGN KEY ("staffId") REFERENCES "public"."staffs"("staffId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffComplaints" ADD CONSTRAINT "staffComplaints_customerId_customers_customerId_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("customerId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffComplaints" ADD CONSTRAINT "staffComplaints_staffId_staffs_staffId_fk" FOREIGN KEY ("staffId") REFERENCES "public"."staffs"("staffId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffComplaints" ADD CONSTRAINT "staffComplaints_serviceId_services_serviceId_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("serviceId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staffNotifications" ADD CONSTRAINT "staffNotifications_staffId_staffs_staffId_fk" FOREIGN KEY ("staffId") REFERENCES "public"."staffs"("staffId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_staffId_staffs_staffId_fk" FOREIGN KEY ("staffId") REFERENCES "public"."staffs"("staffId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userAgreements" ADD CONSTRAINT "userAgreements_agreementId_agreements_id_fk" FOREIGN KEY ("agreementId") REFERENCES "public"."agreements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_id_idx" ON "applications" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "applicant_id_idx" ON "applications" USING btree ("applicantId");--> statement-breakpoint
CREATE INDEX "application_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "application_type_idx" ON "applications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "customer_id_idx" ON "customers" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "customer_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "invoice_number_fk_idx" ON "customers" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX "invoice_number_idx" ON "invoices" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX "invoice_customer_id_idx" ON "invoices" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "status_history_service_id_idx" ON "serviceStatusHistory" USING btree ("serviceId");--> statement-breakpoint
CREATE INDEX "status_history_status_idx" ON "serviceStatusHistory" USING btree ("status");--> statement-breakpoint
CREATE INDEX "service_id_idx" ON "services" USING btree ("serviceId");--> statement-breakpoint
CREATE INDEX "service_customer_id_idx" ON "services" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "service_staff_id_idx" ON "services" USING btree ("staffId");--> statement-breakpoint
CREATE INDEX "service_is_active_idx" ON "services" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "service_type_idx" ON "services" USING btree ("type");--> statement-breakpoint
CREATE INDEX "service_customer_phone_idx" ON "services" USING btree ("customerPhone");--> statement-breakpoint
CREATE INDEX "service_active_type_idx" ON "services" USING btree ("isActive","type");--> statement-breakpoint
CREATE INDEX "sms_log_staff_id_idx" ON "smsLogs" USING btree ("staffId");--> statement-breakpoint
CREATE INDEX "sms_log_status_idx" ON "smsLogs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "staff_id_idx" ON "staffs" USING btree ("staffId");--> statement-breakpoint
CREATE INDEX "staff_username_idx" ON "staffs" USING btree ("username");--> statement-breakpoint
CREATE INDEX "staff_phone_idx" ON "staffs" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "staff_is_verified_idx" ON "staffs" USING btree ("isVerified");--> statement-breakpoint
CREATE INDEX "staff_role_idx" ON "staffs" USING btree ("role");--> statement-breakpoint
CREATE INDEX "staff_verified_role_idx" ON "staffs" USING btree ("isVerified","role");--> statement-breakpoint
CREATE INDEX "staff_active_idx" ON "staffs" USING btree ("isActiveStaff");--> statement-breakpoint
CREATE INDEX "subscription_id_idx" ON "subscriptions" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "subscriber_name_idx" ON "subscriptions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "subscriber_phone_idx" ON "subscriptions" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "subscriber_address_idx" ON "subscriptions" USING btree ("district");--> statement-breakpoint
CREATE INDEX "task_id_idx" ON "tasks" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "task_staff_id_idx" ON "tasks" USING btree ("staffId");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_priority_idx" ON "tasks" USING btree ("priority");