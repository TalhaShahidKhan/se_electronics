"use server";

import { db } from "@/db/drizzle";
import { payments, staffs } from "@/db/schema";
import { SearchParams } from "@/types";
import { generateInvoiceNumber, generateRandomId } from "@/utils";
import { PaymentDataSchema } from "@/validationSchemas";
import { desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import { verifySession } from "@/lib";

export const getPayments = async ({
  query,
  page = "1",
  limit = "20",
}: SearchParams) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const q = `%${query}%`;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;
    const filters = query
      ? or(
          ilike(payments.paymentId, q),
          ilike(payments.invoiceNumber, q),
          ilike(payments.transactionId, q),
          ilike(staffs.staffId, q),
          ilike(staffs.name, q),
          ilike(staffs.phone, q),
        )
      : undefined;
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
}: SearchParams) => {
  const q = `%${query}%`;

  const filters = query
    ? or(
        ilike(payments.paymentId, q),
        ilike(payments.invoiceNumber, q),
        ilike(payments.transactionId, q),
        ilike(staffs.name, q),
        ilike(staffs.phone, q),
      )
    : undefined;

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
  status: "pending" | "processing" | "approved" | "rejected" | "completed",
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

    if (status === "completed" && paymentData.staff?.phone) {
      const { sendSMS } = await import("@/lib");
      await sendSMS(
        paymentData.staff.phone,
        `আপনার পেমেন্ট রিকোয়েস্ট (৳${paymentData.amount}) সম্পন্ন হয়েছে। ধন্যাবাদ।`,
      );
    }

    revalidatePath("/payments");
    revalidatePath("/staff/profile");
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

export async function requestPayment(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);

    const validated = PaymentRequestSchema.parse(data);

    const paymentId = generateRandomId();

    await db.insert(payments).values({
      paymentId,
      invoiceNumber: `REQ-${Date.now()}`,
      staffId: validated.staffId,
      paymentMethod: validated.paymentMethod,
      amount: validated.amount,
      description: validated.description,
      status: "pending",
      date: new Date(),
    });

    revalidatePath("/staff/profile");

    return { success: true, message: "Payment request sent" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to request payment" };
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
