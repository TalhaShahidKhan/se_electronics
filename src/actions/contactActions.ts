"use server";

import { db } from "@/db/drizzle";
import { contactMessages } from "@/db/schema";
import { generateRandomId } from "@/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MessageSchema = z.object({
  customerId: z.string().min(1),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function sendContactMessage(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validated = MessageSchema.parse(rawData);

    await db.insert(contactMessages).values({
      messageId: generateRandomId(),
      ...validated,
    });

    revalidatePath("/customer/profile");
    return { success: true, message: "Message sent! Admin will respond soon." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Please fill all required fields." };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getContactMessagesByCustomer(customerId: string) {
  try {
    const data = await db.query.contactMessages.findMany({
      where: (messages, { eq }) => eq(messages.customerId, customerId),
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch messages" };
  }
}

export async function getAllContactMessages() {
  try {
    const data = await db.query.contactMessages.findMany({
      with: {
        customer: true,
      },
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch messages" };
  }
}

export async function replyToMessage(messageId: string, adminReply: string) {
  try {
    const { eq } = await import("drizzle-orm");
    await db
      .update(contactMessages)
      .set({
        adminReply,
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(contactMessages.messageId, messageId));

    revalidatePath("/messages");
    return { success: true, message: "Reply sent successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not send reply" };
  }
}
