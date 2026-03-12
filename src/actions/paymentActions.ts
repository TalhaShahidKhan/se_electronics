"use server";

import { db } from "@/db/drizzle";
import { payments, staffs } from "@/db/schema";
import { SearchParams } from "@/types";
import { generateInvoiceNumber, generateRandomId } from "@/utils";
import { PaymentDataSchema } from "@/validationSchemas";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import { verifySession } from "@/lib";

export const getPayments = async ({
  query,
  page = "1",
  limit = "20",
  staffId,
}: SearchParams & { staffId?: string }) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const q = `%${query}%`;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;
    const filters = and(
      staffId ? eq(payments.staffId, staffId) : undefined,
      query
        ? or(
            ilike(payments.paymentId, q),
            ilike(payments.invoiceNumber, q),
            ilike(payments.transactionId, q),
            ilike(staffs.staffId, q),
            ilike(staffs.name, q),
            ilike(staffs.phone, q),
          )
        : undefined,
    );
    const paymentsColumns = getTableColumns(payments);
    const paymentsData = await db
      .select({
        ...paymentsColumns,
        staff: {
          staffId: staffs.staffId,
          name: staffs.name,
          phone: staffs.phone,
          role: staffs.role,
        },
      })
      .from(payments)
      .where(filters)
      .innerJoin(staffs, eq(staffs.staffId, payments.staffId))
      .limit(Number(limit))
      .offset(offset)
      .orderBy(desc(payments.date));

    return { success: true, data: paymentsData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch payments" };
  }
};

export const getPaymentsMetadata = async ({
  query,
  page = "1",
  limit = "20",
  staffId,
}: SearchParams & { staffId?: string }) => {
  const q = `%${query}%`;

  const filters = and(
    staffId ? eq(payments.staffId, staffId) : undefined,
    query
      ? or(
          ilike(payments.paymentId, q),
          ilike(payments.invoiceNumber, q),
          ilike(payments.transactionId, q),
          ilike(staffs.name, q),
          ilike(staffs.phone, q),
        )
      : undefined,
  );

  const totalRecords = (
    await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .leftJoin(staffs, eq(staffs.staffId, payments.staffId))
      .where(filters)
  )[0].count;

  const totalPages = Math.ceil(totalRecords / Number(limit));

  return {
    currentPage: Number(page),
    totalRecords,
    totalPages,
    currentLimit: Number(limit),
  };
};

export const getPaymentHistoryById = async (staffId: string) => {
  try {
    const session = await verifySession(false);
    if (!session) return { success: false, message: "Unauthorized" };

    if (session.role === "staff" && session.userId !== staffId) {
      return { success: false, message: "Unauthorized access" };
    }

    const feedbacksData = await db.query.payments.findMany({
      where: eq(payments.staffId, staffId),
      orderBy: (payments, { desc }) => [desc(payments.date)],
    });
    return { success: true, data: feedbacksData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Cannot fetch service history" };
  }
};

export const getPaymentByNumber = async (invoiceNumber: string) => {
  try {
    const paymentData = await db.query.payments.findFirst({
      where: eq(payments.invoiceNumber, invoiceNumber),
      with: {
        staff: {
          columns: {
            name: true,
          },
        },
      },
    });
    return { success: true, data: paymentData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: "requested" | "pending" | "processing" | "approved" | "rejected" | "completed",
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const paymentData = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentId),
      with: {
        staff: true,
      },
    });

    if (!paymentData) return { success: false, message: "Payment not found" };

    await db
      .update(payments)
      .set({ status })
      .where(eq(payments.paymentId, paymentId));

    // Send SMS on completed
    if (status === "completed" && paymentData.staff?.phone) {
      const { sendSMS } = await import("@/lib");
      await sendSMS(
        paymentData.staff.phone,
        `আপনার পেমেন্ট রিকোয়েস্ট (৳${paymentData.amount}) সম্পন্ন হয়েছে। ধন্যাবাদ।`,
      );
    }

    // Create staff notification
    try {
      const { staffNotifications } = await import("@/db/schema");
      const statusMessages: Record<string, string> = {
        pending: `Your payment request of ৳${paymentData.amount} is being processed.`,
        approved: `Your payment request of ৳${paymentData.amount} has been approved and is being processed.`,
        completed: `Your payment of ৳${paymentData.amount} has been completed!`,
        rejected: `Your payment request of ৳${paymentData.amount} has been rejected.`,
      };
      if (statusMessages[status]) {
        await db.insert(staffNotifications).values({
          staffId: paymentData.staffId,
          type: "payment_update",
          message: statusMessages[status],
          link: "/staff/payment",
        });
      }
    } catch (e) {
      console.error("Failed to create notification:", e);
    }

    revalidatePath("/payments");
    revalidatePath("/staff/profile");
    revalidatePath("/staff/payment");
    return { success: true, message: `Payment status updated to ${status}` };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const createPayment = async (
  paymentData: z.infer<typeof PaymentDataSchema>,
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedPaymentInfo = PaymentDataSchema.parse(paymentData);
    const paymentId = generateRandomId();
    const invoiceNumber = generateInvoiceNumber();

    await db.insert(payments).values({
      paymentId,
      invoiceNumber,
      ...validatedPaymentInfo,
    });
    revalidatePath("/payments");
    return { success: true, message: "Payment added successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(z.flattenError(error).fieldErrors);
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

/**
 * Admin adds virtual money to a staff member's balance.
 * This amount will show as "available balance" in the staff dashboard.
 */
export async function addVirtualBalance(staffId: string, amount: number, description?: string) {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    if (amount <= 0) return { success: false, message: "Amount must be greater than 0" };

    const staffData = await db.query.staffs.findFirst({
      where: eq(staffs.staffId, staffId),
    });

    if (!staffData) return { success: false, message: "Staff not found" };

    const paymentId = generateRandomId();
    const invoiceNumber = `BAL-${Date.now()}-${generateRandomId().slice(0, 8)}`;

    await db.insert(payments).values({
      paymentId,
      invoiceNumber,
      staffId,
      paymentMethod: staffData.paymentPreference || "cash",
      amount,
      description: description || "Virtual balance added by admin",
      status: "credited", // credited = counted in balance but not yet requested
      date: new Date(),
    });

    // Create staff notification
    try {
      const { staffNotifications } = await import("@/db/schema");
      await db.insert(staffNotifications).values({
        staffId,
        type: "balance_added",
        message: `Admin added ৳${amount} to your balance.`,
        link: "/staff/payment",
      });
    } catch (e) {
      console.error("Notification error:", e);
    }

    revalidatePath("/payments");
    revalidatePath("/staff/profile");
    revalidatePath("/staff/payment");
    return { success: true, message: `৳${amount} added to ${staffData.name}'s balance` };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

export const updatePayment = async (
  paymentId: string,
  updates: z.infer<typeof PaymentDataSchema>,
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedUpdates = PaymentDataSchema.parse(updates);
    await db
      .update(payments)
      .set(validatedUpdates)
      .where(eq(payments.paymentId, paymentId));
    revalidatePath("/payments");
    return { success: true, message: "Payment updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(z.flattenError(error).fieldErrors);
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const deletePayment = async (paymentId: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    await db.delete(payments).where(eq(payments.paymentId, paymentId));
    revalidatePath("/payments");
    return { success: true, message: "Payment deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};
