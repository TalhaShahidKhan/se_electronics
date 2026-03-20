"use server";

import { db } from "@/db/drizzle";
import { customers, invoices, products } from "@/db/schema";
import { verifySession } from "@/lib";
import { SearchParams } from "@/types";
import { and, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Fetches metadata (pagination info) for customers listing in admin dashboard
 */
export const getCustomersMetadata = async ({
  query,
  page = "1",
  limit = "20",
}: SearchParams) => {
  const q = `%${query}%`;
  const filters = query
    ? or(
        ilike(customers.customerId, q),
        ilike(customers.name, q),
        ilike(customers.phone, q),
        ilike(customers.address, q),
        ilike(customers.invoiceNumber, q),
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
};

/**
 * Fetches customers list for admin dashboard with search and pagination
 */
export const getCustomers = async ({
  query,
  page = "1",
  limit = "20",
}: SearchParams) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const q = `%${query}%`;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;

    const customersData = await db.query.customers.findMany({
      where: query
        ? or(
            ilike(customers.customerId, q),
            ilike(customers.name, q),
            ilike(customers.phone, q),
            ilike(customers.address, q),
            ilike(customers.invoiceNumber, q),
          )
        : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset,
      orderBy: (customers, { desc }) => [desc(customers.createdAt)],
      with: {
        invoice: true,
      },
    });

    return { success: true, data: customersData };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { success: false, message: "Could not fetch customers" };
  }
};

/**
 * Fetches a single customer's full profile for admin view
 */
export const getCustomerById = async (customerId: string) => {
  try {
    const session = await verifySession(false);
    if (!session) return { success: false, message: "Unauthorized" };

    const customerData = await db.query.customers.findFirst({
      where: eq(customers.customerId, customerId),
      with: {
        invoice: {
          with: {
            products: true
          }
        },
        services: true,
        feedbacks: true
      }
    });

    if (!customerData) return { success: false, message: "Customer not found" };

    return { success: true, data: customerData };
  } catch (error) {
    console.error("Error fetching customer by id:", error);
    return { success: false, message: "Something went wrong" };
  }
};

/**
 * Creates a new customer record with associated invoice and products
 */
export const createCustomer = async (data: any, sendLink = false) => {
    try {
        const session = await verifySession(false, "admin");
        if (!session) return { success: false, message: "Unauthorized" };

        const { generateRandomId, generateInvoiceNumber } = await import("@/utils");
        
        const customerId = generateRandomId();
        const invoiceNumber = generateInvoiceNumber();

        // Start a transaction
        return await db.transaction(async (tx) => {
            // 1. Create customer
            await tx.insert(customers).values({
                customerId,
                invoiceNumber,
                name: data.name,
                phone: data.phone,
                address: data.address,
            });

            // 2. Create invoice
            const [invoiceRecord] = await tx.insert(invoices).values({
                invoiceNumber,
                customerId,
                customerName: data.name,
                customerPhone: data.phone,
                customerAddress: data.address,
                date: new Date(data.invoice.date),
                paymentType: data.invoice.paymentType,
                subtotal: data.invoice.subtotal,
                total: data.invoice.total,
                dueAmount: data.invoice.dueAmount,
            }).returning();

            // 3. Create products
            if (data.products && data.products.length > 0) {
                await tx.insert(products).values(
                    data.products.map((p: any) => ({
                        invoiceId: invoiceRecord.id,
                        type: p.type,
                        model: p.model,
                        quantity: p.quantity,
                        unitPrice: p.unitPrice,
                        warrantyStartDate: new Date(p.warrantyStartDate),
                        warrantyDurationMonths: Number(p.warrantyDurationMonths),
                    }))
                );
            }

            if (sendLink) {
                const { sendInvoiceDownloadLink } = await import("./invoiceActions");
                await sendInvoiceDownloadLink(
                    { name: data.name, phoneNumber: data.phone },
                    { 
                        invoiceNumber, 
                        date: data.invoice.date, 
                        totalPrice: data.invoice.total,
                        invoiceType: "customer-invoice" 
                    }
                );
            }

            revalidatePath('/customers');
            return { success: true, message: "Customer created successfully" };
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        return { success: false, message: "Failed to create customer record" };
    }
}

/**
 * Updates an existing customer record and its associated invoice/products
 */
export const updateCustomer = async (customerId: string, data: any, sendLink = false) => {
    try {
        const session = await verifySession(false, "admin");
        if (!session) return { success: false, message: "Unauthorized" };

        const customer = await db.query.customers.findFirst({
            where: eq(customers.customerId, customerId),
            with: { invoice: true }
        });

        if (!customer) return { success: false, message: "Customer not found" };

        return await db.transaction(async (tx) => {
            // 1. Update customer
            await tx.update(customers)
                .set({
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                })
                .where(eq(customers.customerId, customerId));

            // 2. Update invoice
            await tx.update(invoices)
                .set({
                    customerName: data.name,
                    customerPhone: data.phone,
                    customerAddress: data.address,
                    date: new Date(data.invoice.date),
                    paymentType: data.invoice.paymentType,
                    subtotal: data.invoice.subtotal,
                    total: data.invoice.total,
                    dueAmount: data.invoice.dueAmount,
                })
                .where(eq(invoices.customerId, customerId));

            // 3. Update products (delete and recreate for simplicity)
            if (customer.invoice) {
                await tx.delete(products).where(eq(products.invoiceId, customer.invoice.id));
                
                if (data.products && data.products.length > 0) {
                    await tx.insert(products).values(
                        data.products.map((p: any) => ({
                            invoiceId: customer.invoice!.id,
                            type: p.type,
                            model: p.model,
                            quantity: p.quantity,
                            unitPrice: p.unitPrice,
                            warrantyStartDate: new Date(p.warrantyStartDate),
                            warrantyDurationMonths: Number(p.warrantyDurationMonths),
                        }))
                    );
                }
            }

            if (sendLink) {
                const { sendInvoiceDownloadLink } = await import("./invoiceActions");
                await sendInvoiceDownloadLink(
                    { name: data.name, phoneNumber: data.phone },
                    { 
                        invoiceNumber: customer.invoiceNumber, 
                        date: data.invoice.date, 
                        totalPrice: data.invoice.total,
                        invoiceType: "customer-invoice" 
                    }
                );
            }

            revalidatePath('/customers');
            revalidatePath(`/staff/customers/${customerId}`);
            return { success: true, message: "Customer updated successfully" };
        });
    } catch (error) {
        console.error("Error updating customer:", error);
        return { success: false, message: "Failed to update customer record" };
    }
}

/**
 * Deletes a customer and all associated data
 */
export const deleteCustomer = async (id: string) => {
    try {
        const session = await verifySession(false, "admin");
        if (!session) return { success: false, message: "Unauthorized" };

        await db.delete(customers).where(eq(customers.id, id));

        revalidatePath('/customers');
        return { success: true, message: "Customer deleted successfully" };
    } catch (error) {
        console.error("Error deleting customer:", error);
        return { success: false, message: "Failed to delete customer" };
    }
}
