"use server";

import { db } from "@/db/drizzle";
import { payments, staffs } from "@/db/schema";
import { sendSMS } from "@/lib";
import { generateRandomId } from "@/utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PaymentRequestSchema = z.object({
  staffId: z.string().min(1),
  amount: z.coerce.number().min(1),
  description: z.string().optional(),
});

export async function requestPayment(_prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validated = PaymentRequestSchema.parse(rawData);

    const staffData = await db.query.staffs.findFirst({
      where: eq(staffs.staffId, validated.staffId),
    });

    if (!staffData) return { success: false, message: "Staff not found" };

    const method = staffData.paymentPreference;
    const hasWallet = ["bkash", "nagad", "rocket"].includes(method) && staffData.walletNumber;
    const hasBank = method === "bank" && staffData.bankInfo;

    if (method !== "cash" && !hasWallet && !hasBank) {
      return {
        success: false,
        message: "Set your payment method and account details first (Payment Settings).",
      };
    }

    const paymentId = generateRandomId();
    const invoiceNumber = `REQ-${Date.now()}-${generateRandomId().slice(0, 8)}`;

    const insertPayload: Record<string, unknown> = {
      paymentId,
      staffId: validated.staffId,
      invoiceNumber,
      amount: validated.amount,
      paymentMethod: method,
      description: validated.description ?? null,
      status: "pending",
      date: new Date(),
    };
    if (hasWallet) (insertPayload as any).receiverWalletNumber = staffData.walletNumber;
    if (hasBank && staffData.bankInfo) (insertPayload as any).receiverBankInfo = staffData.bankInfo;

    await db.insert(payments).values(insertPayload as typeof payments.$inferInsert);

    if (process.env.ADMIN_PHONE_NUMBER) {
      const smsText = `New Payment Request: Staff ${staffData.name} requested ৳${validated.amount} (${method}). Check dashboard.`;
      await sendSMS(process.env.ADMIN_PHONE_NUMBER, smsText);
    }

    revalidatePath("/staff/profile");
    revalidatePath("/staff/payments");
    revalidatePath("/staff/payment");
    revalidatePath("/staff/payment/request");
    return { success: true, message: "Payment request sent. Admin will be notified." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.issues);
      return {
        success: false,
        message: "Please fill all required fields correctly.",
      };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getStaffPaymentHistory(staffId: string) {
  try {
    const data = await db.query.payments.findMany({
      where: eq(payments.staffId, staffId),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch payment history" };
  }
}
