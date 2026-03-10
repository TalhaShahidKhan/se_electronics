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
  serviceId: z.string().min(1),
  amount: z.coerce.number().min(1),
  paymentMethod: z.enum(["cash", "bkash", "nagad", "rocket", "bank"]),
  description: z.string().optional(),
});

export async function requestPayment(_prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validated = PaymentRequestSchema.parse(rawData);

    // Check if payment already requested for this serviceId
    // But since one service might haveMultiple? User said electrician then technician?
    // User flow: "electrician will request for their payment", "then the technician will request for payment"
    // So one serviceID can have multiple payments (one for electrician, one for technician)

    // We need to fetch staff details to send SMS to admin
    const staffData = await db.query.staffs.findFirst({
      where: eq(staffs.staffId, validated.staffId),
    });

    if (!staffData) return { success: false, message: "Staff not found" };

    const paymentId = generateRandomId();
    await db.insert(payments).values({
      paymentId: paymentId,
      staffId: validated.staffId,
      invoiceNumber: `PAY-${validated.serviceId}-${validated.staffId}`, // Unique invoice for payment request
      amount: validated.amount,
      paymentMethod: validated.paymentMethod,
      description: validated.description,
      status: "pending",
      date: new Date(),
    });

    // Notify admin
    if (process.env.ADMIN_PHONE_NUMBER) {
      await sendSMS(
        process.env.ADMIN_PHONE_NUMBER,
        `New Payment Request: Staff ${staffData.name} has requested ৳${validated.amount} for Service ${validated.serviceId}. Check your dashboard.`,
      );
    }

    revalidatePath("/staff/profile");
    return { success: true, message: "Payment request sent successfully." };
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
