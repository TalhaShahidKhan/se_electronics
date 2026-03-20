'use server'

import { db } from "@/db/drizzle";
import { customers, services, subscriptions, applications, customerNotifications } from "@/db/schema";
import { createSession, deleteSession, verifySession } from "@/lib";
import { eq, and, count, or, ilike } from "drizzle-orm";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Fetches VIP customers for admin management
 */
export const getVipCustomers = async ({ query = '', status = '' }: { query?: string, status?: string }) => {
    try {
        const session = await verifySession(false, 'admin');
        if (!session) return { success: false, message: "Unauthorized access" };

        const q = `%${query}%`;
        const filters = and(
            status ? eq(customers.vipStatus, status as any) : undefined,
            query ? or(
                ilike(customers.name, q),
                ilike(customers.phone, q),
                ilike(customers.customerId, q),
                ilike(customers.vipCardNumber, q)
            ) : undefined
        );

        const data = await db.query.customers.findMany({
            where: filters,
            orderBy: (customers, { desc }) => [desc(customers.updatedAt)]
        });

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching VIP customers:", error);
        return { success: false, message: "Could not fetch VIP customers" };
    }
}

/**
 * Updates a customer's VIP status and generates a card number if approved
 */
export const updateCustomerVipStatus = async (customerId: string, status: string) => {
    try {
        const session = await verifySession(false, 'admin');
        if (!session) return { success: false, message: "Unauthorized" };

        const updates: any = { vipStatus: status };
        if (status === 'approved') {
            const customer = await db.query.customers.findFirst({
                where: eq(customers.customerId, customerId)
            });
            if (customer && !customer.vipCardNumber) {
                const { generateVipCardNumber } = await import("@/utils");
                updates.vipCardNumber = generateVipCardNumber();
            }
        }

        await db.update(customers)
            .set(updates)
            .where(eq(customers.customerId, customerId));

        revalidatePath('/vips');
        revalidatePath('/customer/profile');
        revalidatePath('/customer/vip-card');
        
        return { success: true, message: `Status updated successfully to ${status}` };
    } catch (error) {
        console.error("Error updating VIP status:", error);
        return { success: false, message: "Failed to update status" };
    }
}

/**
 * Fetches notifications for the logged-in customer
 */
export async function getCustomerNotifications() {
    try {
        const session = await verifySession(false, 'customer');
        if (!session || !session.isAuth) return { success: false, message: "Unauthorized" };

        const notifications = await db.query.customerNotifications.findMany({
            where: eq(customerNotifications.customerId, session.userId as string),
            orderBy: (customerNotifications, { desc }) => [desc(customerNotifications.createdAt)]
        });

        return { success: true, data: notifications };
    } catch (error) {
        console.error("Error fetching customer notifications:", error);
        return { success: false, message: "Failed to fetch notifications" };
    }
}

/**
 * Marks a specific notification as read for a customer
 */
export async function markCustomerNotificationAsRead(id: string) {
    try {
        const session = await verifySession(false, 'customer');
        if (!session || !session.isAuth) return { success: false, message: "Unauthorized" };

        await db.update(customerNotifications)
            .set({ isRead: true })
            .where(and(
                eq(customerNotifications.id, id),
                eq(customerNotifications.customerId, session.userId as string)
            ));

        revalidatePath('/customer/notifications');
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false, message: "Failed to mark as read" };
    }
}

export async function verifyCustomerSession() {
    const session = await verifySession(false, 'customer');
    if (!session || !session.isAuth) {
        return { isAuth: false };
    }

    const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, session.userId as string)
    });

    if (!customer) {
        return { isAuth: false };
    }

    return { 
        isAuth: true, 
        userId: session.userId, 
        username: session.username, 
        role: session.role,
        customer 
    };
}

export async function applyForVipCard() {
    const session = await verifySession(true, 'customer');
    
    if (!session) {
        return { success: false, message: "Unauthorized access" };
    }

    const customerId = session.userId as string;

    const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, customerId)
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    // Allow re-applying if rejected or expired
    if (customer.vipStatus === 'approved' || customer.vipStatus === 'pending' || customer.vipStatus === 'processing') {
        return { success: false, message: "Application already exists or member is already VIP" };
    }

    // Update customer status
    await db.update(customers)
        .set({ vipStatus: 'pending' })
        .where(eq(customers.customerId, customerId));

    // Check for existing application record to update or create new one
    const existingApp = await db.query.applications.findFirst({
        where: and(
            eq(applications.applicantId, customerId),
            eq(applications.type, 'vip_card_application')
        )
    });

    if (existingApp) {
        await db.update(applications)
            .set({ status: 'pending', updatedAt: new Date() })
            .where(eq(applications.id, existingApp.id));
    } else {
        const { createApplication } = await import("./applicationActions");
        await createApplication({
            applicantId: customerId,
            type: 'vip_card_application',
            status: 'pending'
        });
    }

    revalidatePath('/customer/vip-card');
    revalidatePath('/customer/profile');
    
    return { success: true, message: "Application submitted successfully" };
}

export async function getCustomerProfileStats(customerId: string) {
    try {
        const [customerData] = await db.select({ phone: customers.phone })
            .from(customers)
            .where(eq(customers.customerId, customerId))
            .limit(1);

        if (!customerData) return { success: false, message: "Customer not found" };

        const serviceCount = await db.select({ count: count() })
            .from(services)
            .where(eq(services.customerId, customerId));

        const subscriptionCount = await db.select({ count: count() })
            .from(subscriptions)
            .where(and(
                eq(subscriptions.phone, customerData.phone),
                eq(subscriptions.isActive, true)
            ));

        return {
            success: true,
            data: {
                totalServices: serviceCount[0].count,
                activeSubscriptions: subscriptionCount[0].count
            }
        };
    } catch (error) {
        console.error("Error fetching customer stats:", error);
        return { success: false, message: "Failed to fetch stats" };
    }
}

export async function customerLogout() {
    await deleteSession();
    redirect('/customer/login');
}

export async function customerLogin(prevState: any, formData: FormData) {
    try {
        const customerId = formData.get('customerId') as string;

        if (!customerId) {
            return { success: false, message: "Customer ID is required" };
        }

        const customer = await db.query.customers.findFirst({
            where: or(
                eq(customers.customerId, customerId),
                eq(customers.invoiceNumber, customerId)
            )
        });

        if (!customer) {
            return { success: false, message: "Invalid Customer ID or Invoice Number" };
        }

        await createSession({ 
            username: customer.name, 
            userId: customer.customerId, 
            role: 'customer' 
        });

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: "Authentication failed. Please try again." };
    }
    
    redirect("/customer/profile");
}
