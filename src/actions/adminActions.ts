"use server";

import { db } from "@/db/drizzle";
import { admins } from "@/db/schema";
import { verifySession } from "@/lib";
import { eq } from "drizzle-orm";

export const getAdmin = async () => {
  const session = await verifySession();

  try {
    const adminData = await db.query.admins.findFirst({
      where: eq(admins.username, session?.username as string),
    });
    return { success: true, data: adminData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getAdminStats = async () => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const { services, customers, staffs, payments, invoices, subscriptions } =
      await import("@/db/schema");
    const { count, eq, sql } = await import("drizzle-orm");

    const [
      servicesCount,
      customersCount,
      staffCount,
      pendingPaymentsCount,
      revenueData,
      subscriptionsCount,
    ] = await Promise.all([
      db.select({ count: count() }).from(services),
      db.select({ count: count() }).from(customers),
      db.select({ count: count() }).from(staffs),
      db
        .select({ count: count() })
        .from(payments)
        .where(eq(payments.status, "pending")),
      db.select({ sum: sql<number>`sum(total)::numeric` }).from(invoices),
      db
        .select({ count: count() })
        .from(subscriptions)
        .where(eq(subscriptions.isActive, true)),
    ]);

    return {
      success: true,
      data: {
        totalServices: servicesCount[0].count,
        totalCustomers: customersCount[0].count,
        totalStaff: staffCount[0].count,
        pendingPayments: pendingPaymentsCount[0].count,
        totalRevenue: Number(revenueData[0].sum) || 0,
        activeSubscriptions: subscriptionsCount[0].count,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch admin stats" };
  }
};

export const getAdminNotifications = async () => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const { adminNotifications } = await import("@/db/schema");
    const { desc } = await import("drizzle-orm");

    const notifications = await db.query.adminNotifications.findMany({
      orderBy: [desc(adminNotifications.createdAt)],
      limit: 10,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch notifications" };
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const { adminNotifications } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(adminNotifications)
      .set({ isRead: true })
      .where(eq(adminNotifications.id, id));

    return { success: true, message: "Notification marked as read" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

