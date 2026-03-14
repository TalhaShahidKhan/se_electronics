"use server";

import { db } from "@/db/drizzle";
import { customerNotifications, staffNotifications } from "@/db/schema";
import { sendSMS } from "@/lib";
import { generateUrl } from "@/utils";
import { revalidatePath } from "next/cache";

/**
 * Creates a notification and sends a shortened SMS to a customer
 */
export async function notifyCustomer({
  customerId,
  phoneNumber,
  type,
  message,
  shortMessage,
  link,
}: {
  customerId: string;
  phoneNumber: string;
  type: string;
  message: string;
  shortMessage?: string;
  link?: string;
}) {
  try {
    // 1. Create notification in database
    await db.insert(customerNotifications).values({
      customerId,
      type,
      message,
      link,
    });

    // 2. Send shortened SMS
    // If no shortMessage provided, use a default one
    const smsContent = shortMessage || `প্রিয় গ্রাহক, আপনার ড্যাশবোর্ডে একটি নতুন বার্তা আছে। বিস্তারিত দেখুন: ${generateUrl("customer-login", {})}`;
    
    await sendSMS(phoneNumber, smsContent);

    revalidatePath("/customer/profile");
    return { success: true };
  } catch (error) {
    console.error("Error in notifyCustomer:", error);
    return { success: false, error };
  }
}

/**
 * Creates a notification and sends a shortened SMS to a staff member
 */
export async function notifyStaff({
  staffId,
  phoneNumber,
  type,
  message,
  shortMessage,
  link,
}: {
  staffId: string;
  phoneNumber: string;
  type: string;
  message: string;
  shortMessage?: string;
  link?: string;
}) {
  try {
    // 1. Create notification in database
    await db.insert(staffNotifications).values({
      staffId,
      type,
      message,
      link,
    });

    // 2. Send shortened SMS
    const smsContent = shortMessage || `Dear Staff, you have a new notification. Check your portal for details.`;
    
    await sendSMS(phoneNumber, smsContent);

    revalidatePath("/staff/profile");
    return { success: true };
  } catch (error) {
    console.error("Error in notifyStaff:", error);
    return { success: false, error };
  }
}
