"use server";

import { db } from "@/db/drizzle";
import { customers, invoices, products } from "@/db/schema";
import { createSession, decrypt, deleteSession } from "@/lib";
import { SearchParams } from "@/types";
import { generateInvoiceNumber, generateRandomId } from "@/utils";
import { CustomerDataSchema, CustomerLoginSchema } from "@/validationSchemas";
import { eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import z, { ZodError, flattenError } from "zod";
import { sendInvoiceDownloadLink } from "./invoiceActions";

export const getCustomerById = async (customerId: string) => {
  try {
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
    const customer = await db.query.customers.findFirst({
      where: eq(customers.customerId, session.userId as string),
      columns: {
        id: true,
        customerId: true,
        name: true,
        phone: true,
        address: true,
      },
    });

    if (!customer) {
      return { isAuth: false };
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
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/customers");
    revalidatePath("/invoices");
    return { success: true, message: "Customer deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};
