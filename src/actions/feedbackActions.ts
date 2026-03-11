'use server'

import { db } from "@/db/drizzle"
import { feedbacks, services } from "@/db/schema"
import { sendEmail, verifySession } from "@/lib"
import { ProductTypes, SearchParams } from "@/types"
import { FeedbackDataSchema } from "@/validationSchemas"
import { desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { updateStaffStats } from "./staffActions"
import z from "zod"

export const getFeedbackById = async (serviceId: string) => {
    try {
        const feedback = await db.query.feedbacks.findFirst({
            where: eq(feedbacks.serviceId, serviceId)
        })
        return {
            success: true,
            data: feedback
        }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
}

export const getFeedbackHistoryById = async (id: string) => {
    try {
        const feedbacksData = await db.query.feedbacks.findMany({
            where: eq(feedbacks.customerId, id),
            columns: {
                id: true,
                feedbacks: true,
                createdAt: true
            },
            with: {
                service: {
                    columns: {
                        id: true,
                        serviceId: true,
                        customerId: true,
                        customerName: true,
                        staffId: true,
                        staffName: true,
                        customerAddress: true,
                        customerAddressDistrict: true,
                        type: true,
                        productType: true,
                        productModel: true,
                        createdAt: true
                    }
                }
            },
            orderBy: (feedbacks, { desc }) => [desc(feedbacks.createdAt)]
        })
        return { success: true, data: feedbacksData }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Cannot fetch service history' }
    }
}

export const getFeedbacksMetadata = async ({ query, page = '1', limit = '20' }: SearchParams) => {
    const q = `%${query}%`
    const filters = query ? or(
        ilike(feedbacks.customerId, q),
        ilike(services.customerName, q),
        ilike(services.customerPhone, q),
        sql<string>`cast(${services.productType} as text) ilike ${q}`,
        ilike(services.productModel, q),
        ilike(services.staffName, q),
        ilike(services.staffPhone, q),
    ) : undefined

    const totalRecords = (await db.select({ count: sql<number>`count(*)` })
        .from(feedbacks)
        .where(filters)
        .innerJoin(services, eq(services.serviceId, feedbacks.serviceId)))[0].count

    const totalPages = limit ? Math.ceil(totalRecords / Number(limit)) : 1;

    return {
        currentPage: Number(page),
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentLimit: Number(limit)
    }
}

export const getFeedbacks = async ({ query, page = '1', limit = '20' }: SearchParams) => {
    try {
        const session = await verifySession(false)
        if (!session || (session.role !== "admin" && session.role !== "staff")) {
            return { success: false, message: "Unauthorized" };
        }
        const q = `%${query}%`
        const offset = (page && limit) ? (Number(page) - 1) * Number(limit) : 0
        const filters = query ? or(
            ilike(feedbacks.customerId, q),
            ilike(services.customerName, q),
            ilike(services.customerPhone, q),
            sql<string>`cast(${services.productType} as text) ilike ${q}`,
            ilike(services.productModel, q),
            ilike(services.staffName, q),
            ilike(services.staffPhone, q),
        ) : undefined

        const feedbackColumns = getTableColumns(feedbacks)
        const feedbacksData = await db.select({
            ...feedbackColumns,
            service: {
                type: services.type,
                customerId: services.customerId,
                customerName: services.customerName,
                customerPhone: services.customerPhone,
                customerAddress: services.customerAddress,
                productType: services.productType,
                productModel: services.productModel,
                staffId: services.staffId,
                staffName: services.staffName,
                staffPhone: services.staffPhone
            }
        })
            .from(feedbacks)
            .where(filters)
            .innerJoin(services, eq(services.serviceId, feedbacks.serviceId))
            .limit(Number(limit))
            .offset(offset)
            .orderBy(desc(feedbacks.createdAt))

        return { success: true, data: feedbacksData }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Could not fetch feedbacks' }
    }
}

export async function createFeedback(feedbackInfo: z.infer<typeof FeedbackDataSchema>) {
    try {
        const session = await verifySession(false)
        if (!session) return { success: false, message: "Unauthorized" }

        const validatedFeedbackInfo = FeedbackDataSchema.parse(feedbackInfo)

        // Ensure customer can only feedback their own service
        if (session.role === "customer" && session.userId !== validatedFeedbackInfo.customerId) {
            return { success: false, message: "Unauthorized access" }
        }
        await db.insert(feedbacks).values(validatedFeedbackInfo).onConflictDoUpdate({
            target: feedbacks.serviceId,
            set: {
                ...validatedFeedbackInfo
            }
        })

        revalidatePath('/feedbacks')

        // Update staff stats (rating) when feedback is submitted
        const service = await db.query.services.findFirst({
            where: eq(services.serviceId, validatedFeedbackInfo.serviceId),
            columns: { staffId: true }
        });
        if (service?.staffId) {
            updateStaffStats(service.staffId).catch(err =>
                console.error('Failed to update staff stats after feedback:', err)
            );
        }

        await sendEmail({
            from: `"New Feedback" <${process.env.EMAIL}>`,
            subject: 'Feedback Notification',
            text: `A feedback was added to your dashboard by a customer.\nView Feedback: ${process.env.NEXT_PUBLIC_BASE_URL}/feedbacks`
        })

        return { success: true, message: 'Feedback sent' }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
}

export async function deleteFeedback(serviceId: string) {
    try {
        const session = await verifySession(false, "admin")
        if (!session) return { success: false, message: "Unauthorized" }

        await db.delete(feedbacks).where(eq(feedbacks.serviceId, serviceId))
        revalidatePath('/feedbacks')
        return { success: true, message: 'Feedback deleted' }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }

    }
}

export async function getStaffFeedbacks(staffId: string) {
    try {
        const feedbacksData = await db.select({
            id: feedbacks.id,
            serviceId: feedbacks.serviceId,
            customerId: feedbacks.customerId,
            rating: feedbacks.rating,
            feedbacks: feedbacks.feedbacks,
            createdAt: feedbacks.createdAt,
            customerName: services.customerName,
            productType: services.productType,
            productModel: services.productModel,
            serviceType: services.type,
        })
            .from(feedbacks)
            .innerJoin(services, eq(services.serviceId, feedbacks.serviceId))
            .where(eq(services.staffId, staffId))
            .orderBy(desc(feedbacks.createdAt))
            .limit(50)

        return { success: true, data: feedbacksData }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Could not fetch staff feedbacks' }
    }
}