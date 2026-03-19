"use server";

import { db } from "@/db/drizzle";
import { noticeRecipients, notices, staffs } from "@/db/schema";
import { sendEmail, verifySession } from "@/lib";
import { NoticeType } from "@/types";
import { generateRandomId } from "@/utils";
import { NoticeSchema } from "@/validationSchemas";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createNotice = async (data: z.infer<typeof NoticeSchema>) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedData = NoticeSchema.parse(data);
    const noticeId = generateRandomId();

    const [newNotice] = await db
      .insert(notices)
      .values({
        noticeId,
        title: validatedData.title,
        content: validatedData.content,
        priority: validatedData.priority,
        targetType: validatedData.targetType,
        isDraft: validatedData.isDraft,
        scheduledAt: validatedData.scheduledAt,
        expiresAt: validatedData.expiresAt,
        createdBy: session.userId as any,
      })
      .returning();

    // If not a draft and scheduled for now (or not scheduled), dispatch immediately
    if (!validatedData.isDraft && (!validatedData.scheduledAt || validatedData.scheduledAt <= new Date())) {
      await dispatchNotice(newNotice.id, validatedData.targetType, validatedData.recipientIds);
    }

    revalidatePath("/(dashboard)/notices");
    return { success: true, message: "Notice created successfully", data: newNotice };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not create notice" };
  }
};

export const updateNotice = async (id: string, data: z.infer<typeof NoticeSchema>) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedData = NoticeSchema.parse(data);

    const [updatedNotice] = await db
      .update(notices)
      .set({
        title: validatedData.title,
        content: validatedData.content,
        priority: validatedData.priority,
        targetType: validatedData.targetType,
        isDraft: validatedData.isDraft,
        scheduledAt: validatedData.scheduledAt,
        expiresAt: validatedData.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(notices.id, id))
      .returning();

    // If it was a draft and now it's published and scheduled for now, dispatch
    // Note: This logic might need to be more sophisticated to avoid double dispatching
    // For simplicity, we can check if noticeRecipients already exist for this notice
    const existingRecipients = await db.query.noticeRecipients.findFirst({
        where: eq(noticeRecipients.noticeId, id)
    });

    if (!validatedData.isDraft && !existingRecipients && (!validatedData.scheduledAt || validatedData.scheduledAt <= new Date())) {
        await dispatchNotice(updatedNotice.id, validatedData.targetType, validatedData.recipientIds);
    }

    revalidatePath("/(dashboard)/notices");
    return { success: true, message: "Notice updated successfully", data: updatedNotice };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not update notice" };
  }
};

export const deleteNotice = async (id: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    await db.delete(notices).where(eq(notices.id, id));

    revalidatePath("/(dashboard)/notices");
    return { success: true, message: "Notice deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not delete notice" };
  }
};

export const getNotices = async () => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const data = await db.query.notices.findMany({
      orderBy: [desc(notices.createdAt)],
      with: {
        recipients: {
            with: {
                staff: {
                    columns: {
                        name: true,
                        staffId: true
                    }
                }
            }
        },
        creator: {
            columns: {
                username: true
            }
        }
      }
    });

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch notices" };
  }
};

export const getStaffNotices = async () => {
  try {
    const session = await verifySession(false, "staff");
    if (!session) return { success: false, message: "Unauthorized" };

    const data = await db
      .select({
        id: noticeRecipients.id,
        noticeId: noticeRecipients.noticeId,
        staffId: noticeRecipients.staffId,
        customerId: noticeRecipients.customerId,
        isRead: noticeRecipients.isRead,
        readAt: noticeRecipients.readAt,
        isAcknowledged: noticeRecipients.isAcknowledged,
        acknowledgedAt: noticeRecipients.acknowledgedAt,
        createdAt: noticeRecipients.createdAt,
        notice: notices,
      })
      .from(noticeRecipients)
      .leftJoin(notices, eq(noticeRecipients.noticeId, notices.id))
      .where(eq(noticeRecipients.staffId, session.userId as string))
      .orderBy(desc(noticeRecipients.createdAt));


    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch notifications" };
  }
};
export const getCustomerNotices = async () => {
  try {
    const session = await verifySession(false, "customer");
    if (!session) return { success: false, message: "Unauthorized" };

    const data = await db
      .select({
        id: noticeRecipients.id,
        noticeId: noticeRecipients.noticeId,
        staffId: noticeRecipients.staffId,
        customerId: noticeRecipients.customerId,
        isRead: noticeRecipients.isRead,
        readAt: noticeRecipients.readAt,
        isAcknowledged: noticeRecipients.isAcknowledged,
        acknowledgedAt: noticeRecipients.acknowledgedAt,
        createdAt: noticeRecipients.createdAt,
        notice: notices,
      })
      .from(noticeRecipients)
      .leftJoin(notices, eq(noticeRecipients.noticeId, notices.id))
      .where(eq(noticeRecipients.customerId, session.userId as string))
      .orderBy(desc(noticeRecipients.createdAt));


    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch notifications" };
  }
};

export const markNoticeAsRead = async (recipientId: string) => {
  try {
    const session = await verifySession(false);
    if (!session) return { success: false, message: "Unauthorized" };

    if (session.role === "staff") {
      await db
        .update(noticeRecipients)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(noticeRecipients.id, recipientId),
            eq(noticeRecipients.staffId, session.userId as string)
          )
        );
      revalidatePath("/staff/profile");
    } else if (session.role === "customer") {
      await db
        .update(noticeRecipients)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(noticeRecipients.id, recipientId),
            eq(noticeRecipients.customerId, session.userId as string)
          )
        );
      revalidatePath("/customer/profile");
    }

    return { success: true, message: "Marked as read" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not update notification" };
  }
};

export const acknowledgeNotice = async (recipientId: string) => {
    try {
      const session = await verifySession(false, "staff");
      if (!session) return { success: false, message: "Unauthorized" };
  
      await db
        .update(noticeRecipients)
        .set({
          isAcknowledged: true,
          acknowledgedAt: new Date(),
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(noticeRecipients.id, recipientId),
            eq(noticeRecipients.staffId, session.userId as string)
          )
        );
  
      revalidatePath("/staff/profile");
      return { success: true, message: "Acknowledged" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Could not acknowledge notice" };
    }
};

async function dispatchNotice(noticeInternalId: string, targetType: string, recipientIds?: string[]) {
    const notice = await db.query.notices.findFirst({
        where: eq(notices.id, noticeInternalId)
    });

    if (!notice) return;

    let targetStaff: { staffId: string, name: string, phone: string, username: string | null }[] = [];

    if (targetType === "all") {
        targetStaff = await db.query.staffs.findMany({
            where: eq(staffs.isActiveStaff, true),
            columns: { staffId: true, name: true, phone: true, username: true }
        });
    } else if (recipientIds && recipientIds.length > 0) {
        targetStaff = await db.query.staffs.findMany({
            where: inArray(staffs.staffId, recipientIds),
            columns: { staffId: true, name: true, phone: true, username: true }
        });
    }

    if (targetStaff.length > 0) {
        const values = targetStaff.map(s => ({
            noticeId: noticeInternalId,
            staffId: s.staffId,
        }));
        await db.insert(noticeRecipients).values(values);

        // Send emails/SMS for high/urgent priority notices
        if (notice.priority === "high" || notice.priority === "urgent") {
            const emailPromises = targetStaff
                .filter(s => s.username && s.username.includes('@'))
                .map(s => 
                    sendEmail({
                        from: "SE Electronics <noreply@seelectronics.com>",
                        to: s.username!,
                        subject: `[${notice.priority.toUpperCase()}] ${notice.title}`,
                        text: `${notice.title}\n\n${notice.content}\n\nPlease acknowledge this notice in your staff dashboard.`
                    }).catch(e => console.error(`Email delivery failed for ${s.username}`, e))
                );
            
            await Promise.all(emailPromises);
        }
    }
}

