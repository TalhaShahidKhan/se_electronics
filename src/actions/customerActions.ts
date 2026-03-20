"use server";

import { db } from "@/db/drizzle";
import { customers, invoices, products } from "@/db/schema";
import { createSession, decrypt, deleteSession, verifySession } from "@/lib";
import { SearchParams } from "@/types";
import { generateInvoiceNumber, generateRandomId } from "@/utils";
import { CustomerDataSchema, CustomerLoginSchema } from "@/validationSchemas";
import { and, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import z, { ZodError, flattenError } from "zod";
import { sendInvoiceDownloadLink } from "./invoiceActions";

export const getCustomerById = async (customerId: string) => {
  try {
    const session = await verifySession(false);
    if (!session) return { success: false, message: "Unauthorized" };

    // Prevent customers from viewing other customers' data
    if (session.role === "customer" && session.userId !== customerId) {
      return { success: false, message: "Unauthorized access to profile" };
    }

    const customerData = await db.query.customers.findFirst({
      where: eq(customers.customerId, customerId),
      with: {
        invoice: {
          columns: {
            customerName: false,
            customerPhone: false,
            customerAddress: false,
          },
        },
      },
    });
    if (!customerData) return { success: false, message: "Customer not found" };
    return { success: true, data: customerData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

// ============================================
// CUSTOMER AUTHENTICATION
// ============================================

export async function customerLogin(prevState: any, credentials: FormData) {
  try {
    const { customerId } = CustomerLoginSchema.parse(
      Object.fromEntries(credentials),
    );

    const identifier = customerId as string;

    const customer = await db.query.customers.findFirst({
      where: or(
        eq(customers.customerId, identifier),
        eq(customers.invoiceNumber, identifier),
      ),
    });

    if (!customer) {
      return {
        success: false,
        message: "Invalid Customer ID or Invoice Number",
      };
    }

    await createSession({
      username: customer.name,
      userId: customer.customerId,
      role: "customer",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(flattenError(error).fieldErrors);
      return {
        success: false,
        message: "অনুগ্রহ করে কাস্টমার আইডি প্রদান করুন।",
      };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }

  redirect("/customer/profile", RedirectType.replace);
}

export async function customerLogout() {
  await deleteSession();
  redirect("/customer/login", RedirectType.replace);
}

export async function verifyCustomerSession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session.role !== "customer") {
    return { isAuth: false };
  }

  try {
    const [customer] = await db
      .select({
        id: customers.id,
        customerId: customers.customerId,
        name: customers.name,
        phone: customers.phone,
        address: customers.address,
        vipCardNumber: customers.vipCardNumber,
        vipStatus: customers.vipStatus,
        vipExpiryDate: customers.vipExpiryDate,
      })
      .from(customers)
      .where(eq(customers.customerId, session.userId as string))
      .limit(1);


    if (!customer) {
      return { isAuth: false };
    }

    // Process VIP status for expiration
    if (customer.vipStatus === 'approved' && customer.vipExpiryDate && new Date(customer.vipExpiryDate) < new Date()) {
       (customer as any).vipStatus = 'expired';
    }

    return {
      isAuth: true,
      userId: session.userId,
      username: session.username,
      role: "customer",
      customer,
    };
  } catch (error) {
    console.error("verifyCustomerSession database error:", error);
    return { isAuth: false };
  }
}

// REMOVED: setCustomerCredentials is no longer needed in passwordless system

export const getCustomersMetadata = async ({
  query,
  page = "1",
  limit = "20",
}: SearchParams) => {
  try {
    const q = `%${query}%`;
    const filters = query
      ? or(
          ilike(customers.customerId, q),
          ilike(customers.invoiceNumber, q),
          ilike(customers.name, q),
          ilike(customers.phone, q),
          ilike(customers.address, q),
        )
      : undefined;

    const totalRecords = await db.$count(customers, filters);
    const totalPages = limit ? Math.ceil(totalRecords / Number(limit)) : 1;

    return {
      currentPage: Number(page),
      totalRecords: totalRecords,
      totalPages: totalPages,
      currentLimit: Number(limit),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getCustomers = async ({
  query,
  page = "1",
  limit = "20",
}: SearchParams) => {
  try {
    const q = `%${query}%`;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;

    const queryFilters = query
      ? or(
          ilike(customers.customerId, q),
          ilike(customers.invoiceNumber, q),
          ilike(customers.name, q),
          ilike(customers.phone, q),
          ilike(customers.address, q),
        )
      : undefined;

    const customersData = await db.query.customers.findMany({
      where: queryFilters,
      with: {
        invoice: true,
      },
      limit: limit ? Number(limit) : undefined,
      offset: offset,
      orderBy: (customers, { desc }) => [desc(customers.createdAt)],
    });

    return { success: true, data: customersData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch customers" };
  }
};

export const createCustomer = async (
  customerData: z.infer<typeof CustomerDataSchema>,
  sendInvoiceLink: boolean,
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedCustomerData = CustomerDataSchema.parse(customerData);
    const {
      invoice: invoiceInfo,
      products: productItems,
      ...customerInfo
    } = validatedCustomerData;

    const customerId = generateRandomId();
    const invoiceId = uuidv4();
    const invoiceNumber = generateInvoiceNumber();

    await db.transaction(async (tx) => {
      await tx.insert(customers).values({
        customerId,
        invoiceNumber,
        createdAt: invoiceInfo.date,
        ...customerInfo,
      });

      await tx.insert(invoices).values({
        id: invoiceId,
        invoiceNumber: invoiceNumber,
        customerId: customerId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        ...invoiceInfo,
      });

      await tx
        .insert(products)
        .values(
          productItems.map((product) => ({ invoiceId: invoiceId, ...product })),
        );
    });

    if (sendInvoiceLink) {
      await sendInvoiceDownloadLink(
        {
          name: customerInfo.name,
          phoneNumber: customerInfo.phone,
        },
        {
          invoiceNumber: invoiceNumber,
          customerId: customerId,
          date: invoiceInfo.date,
          totalPrice: invoiceInfo.total,
          invoiceType: "customer-invoice",
        },
      );
    }

    revalidatePath("/customers");
    revalidatePath("/invoices");

    return { success: true, message: "Customer created" };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = flattenError(error).fieldErrors;
      console.error(fieldErrors);
      const firstErrorField = Object.keys(fieldErrors)[0];
      const errorMessage = firstErrorField 
        ? `অনুগ্রহ করে সঠিক ভাবে ${firstErrorField} প্রদান করুন।`
        : "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।";
      return {
        success: false,
        message: errorMessage,
      };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const updateCustomer = async (
  customerId: string,
  customerData: z.infer<typeof CustomerDataSchema>,
  sendInvoiceLink: boolean,
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedCustomerData = CustomerDataSchema.parse(customerData);
    const {
      invoice: invoiceInfo,
      products: productItems,
      ...customerInfo
    } = validatedCustomerData;

    const invoiceId = uuidv4();
    const invoiceNumber = generateInvoiceNumber();

    await db.transaction(async (tx) => {
      await tx.delete(invoices).where(eq(invoices.customerId, customerId));
      await tx
        .update(customers)
        .set({ invoiceNumber, ...customerInfo })
        .where(eq(customers.customerId, customerId));
      await tx.insert(invoices).values({
        id: invoiceId,
        invoiceNumber: invoiceNumber,
        customerId: customerId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        ...invoiceInfo,
      });
      await tx
        .insert(products)
        .values(
          productItems.map((product) => ({ invoiceId: invoiceId, ...product })),
        );
    });

    if (sendInvoiceLink) {
      await sendInvoiceDownloadLink(
        {
          name: customerInfo.name,
          phoneNumber: customerInfo.phone,
        },
        {
          invoiceNumber: invoiceNumber,
          customerId: customerId,
          date: invoiceInfo.date,
          totalPrice: invoiceInfo.total,
          invoiceType: "customer-invoice",
        },
      );
    }

    revalidatePath("/customers");
    revalidatePath("/invoices");

    return { success: true, message: "Customer Updated" };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(flattenError(error).fieldErrors);
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }

    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/customers");
    revalidatePath("/invoices");
    return { success: true, message: "Customer deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getCustomerNotifications = async () => {
  try {
    const session = await verifySession(false, "customer");
    if (!session) return { success: false, message: "Unauthorized" };

    const { customerNotifications } = await import("@/db/schema");
    const { desc } = await import("drizzle-orm");

    const notifications = await db
      .select()
      .from(customerNotifications)
      .where(eq(customerNotifications.customerId, session.userId as string))
      .orderBy(desc(customerNotifications.createdAt))
      .limit(10);


    return { success: true, data: notifications };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch notifications" };
  }
};

export const markCustomerNotificationAsRead = async (id: string) => {
  try {
    const session = await verifySession(false, "customer");
    if (!session) return { success: false, message: "Unauthorized" };

    const { customerNotifications } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(customerNotifications)
      .set({ isRead: true })
      .where(eq(customerNotifications.id, id));

    return { success: true, message: "Notification marked as read" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getCustomerProfileStats = async (customerId: string) => {
  try {
    const session = await verifySession(false, "customer");
    if (!session || session.userId !== customerId) {
      return { success: false, message: "Unauthorized" };
    }

    const { services, subscriptions, customers } = await import("@/db/schema");
    const { count, and, eq } = await import("drizzle-orm");

    const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, customerId),
        columns: { phone: true }
    });

    if (!customer) return { success: false, message: "Customer not found" };

    const [servicesDone, activeSubs] = await Promise.all([
      db.$count(services, eq(services.customerId, customerId)),
      db.$count(subscriptions, and(eq(subscriptions.phone, customer.phone), eq(subscriptions.isActive, true)))
    ]);

    return {
      success: true,
      data: {
        totalServices: servicesDone,
        activeSubscriptions: activeSubs
      }
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch stats" };
  }
};

export const applyForVipCard = async () => {
  try {
    const session = await verifyCustomerSession();
    if (!session.isAuth || !session.customer) {
      return { success: false, message: "Unauthorized" };
    }

    const { applications, customers } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    // Check if customer already has a VIP card or an active application
    const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, session.userId as string),
        columns: { vipStatus: true, name: true, phone: true, vipExpiryDate: true }
    });

    const isExpired = customer?.vipStatus === 'approved' && customer?.vipExpiryDate && new Date(customer.vipExpiryDate) < new Date();

    if (customer?.vipStatus === 'approved' && !isExpired) {
        return { success: false, message: "You already have a VIP card" };
    }

    if (customer?.vipStatus === 'pending' || customer?.vipStatus === 'processing') {
        return { success: false, message: "Your VIP application is already being processed" };
    }

    const { createApplication } = await import("./applicationActions");
    const { notifyAdmin } = await import("./notificationActions");
    const { ApplicationMessages } = await import("@/constants/messages");

    const applicationRes = await createApplication({
        applicantId: session.userId as string,
        type: "vip_card_application",
        status: "pending",
    });

    if (!applicationRes.success) return applicationRes;

    // Update customer's vipStatus to pending
    await db.update(customers)
        .set({ vipStatus: "pending" })
        .where(eq(customers.customerId, session.userId as string));

    // Notify Admin
    await notifyAdmin({
        type: 'vip_card_application',
        message: `${customer?.name} has applied for a VIP Card.`,
        link: `/applications?type=vip_card`
    });

    revalidatePath("/customer/vip-card");
    
    return { success: true, message: "Application submitted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};
export const getVipCustomers = async ({
  query,
  page = "1",
  limit = "20",
  status,
}: SearchParams & { status?: "pending" | "approved" | "rejected" | "processing" }) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const q = `%${query}%`;
    const offset = (Number(page) - 1) * Number(limit);

    const whereFilters = [
      status ? eq(customers.vipStatus, status) : or(eq(customers.vipStatus, "pending"), eq(customers.vipStatus, "approved"), eq(customers.vipStatus, "processing")),
      query
        ? or(
            ilike(customers.name, q),
            ilike(customers.phone, q),
            ilike(customers.customerId, q),
            ilike(customers.vipCardNumber, q),
          )
        : undefined,
    ].filter(Boolean);

    const data = await db.query.customers.findMany({
      where: and(...whereFilters as any),
      limit: Number(limit),
      offset: offset,
      orderBy: (customers, { desc }) => [desc(customers.updatedAt)],
    });

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch VIP customers" };
  }
};

export const updateCustomerVipStatus = async (
  customerId: string,
  status: "approved" | "rejected" | "processing" | "pending",
  cardNumber?: string
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    let finalCardNumber = cardNumber;
    if (status === "approved" && !finalCardNumber) {
      // Generate unique 16-digit card number if not provided
      finalCardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
      
      // Check for uniqueness
      const existing = await db.query.customers.findFirst({
        where: eq(customers.vipCardNumber, finalCardNumber),
      });
      if (existing) {
        // Simple retry once
        finalCardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
      }
    }

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    await db.update(customers)
      .set({ 
        vipStatus: status,
        ...(status === "approved" ? { 
            vipCardNumber: finalCardNumber,
            vipExpiryDate: expiryDate 
        } : {}),
        ...(status === "rejected" ? { 
            vipCardNumber: null,
            vipExpiryDate: null 
        } : {})
      })
      .where(eq(customers.customerId, customerId));

    // Notify customer
    const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, customerId),
        columns: { phone: true, name: true }
    });

    if (customer && status === "approved") {
      const { sendSMS } = await import("@/lib/sms");
      const formattedExpiry = new Intl.DateTimeFormat("en-US", {
          month: "2-digit",
          year: "2-digit",
      }).format(expiryDate);
      const message = `Congratulations ${customer.name}! Your VIP Card has been approved. Card Number: ${finalCardNumber}. Valid until: ${formattedExpiry}. Enjoy exclusive benefits at SE Electronics.`;
      await sendSMS(customer.phone, message);
    }

    revalidatePath("/vips");
    revalidatePath("/customers");
    revalidatePath("/customer/vip-card");

    return { 
        success: true, 
        message: status === "approved" ? `VIP Card Approved: ${finalCardNumber}` : "Status updated" 
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};
