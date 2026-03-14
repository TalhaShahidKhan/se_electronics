"use server";

import { ApplicationMessages } from "@/constants/messages";
import {
  discounts,
  subscriptionPlans,
  voltSurcharges,
} from "@/constants/subscription-plans";
import { db } from "@/db/drizzle";
import { applications, subscriptions } from "@/db/schema";
import { sendSMS, verifySession } from "@/lib";
import { SearchParams } from "@/types";
import { generateRandomId, generateUrl, renderText } from "@/utils";
import { SubscriptionDataSchema } from "@/validationSchemas";
import { and, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ZodError, flattenError } from "zod";
import { createApplication } from "./applicationActions";

export const getSubscriptionPrices = async () => {
  return subscriptionPlans;
};

export const getSubscribers = async ({
  query,
  page = "1",
  limit = "20",
}: SearchParams) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const q = `%${query}%`;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;

    const subscribersData = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.isActive, true),
        query
          ? or(
              ilike(subscriptions.subscriptionId, q),
              ilike(subscriptions.name, q),
              ilike(subscriptions.phone, q),
              ilike(subscriptions.district, q),
            )
          : undefined,
      ),
      limit: limit ? Number(limit) : undefined,
      offset: offset,
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });
    return { success: true, data: subscribersData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch subscribers" };
  }
};

export const getSubscribersMetadata = async ({
  query,
  page = "1",
  limit = "20",
}: SearchParams) => {
  const q = `%${query}%`;
  const filters = and(
    eq(subscriptions.isActive, true),
    query
      ? or(
          ilike(subscriptions.subscriptionId, q),
          ilike(subscriptions.name, q),
          ilike(subscriptions.phone, q),
          ilike(subscriptions.district, q),
        )
      : undefined,
  );

  const totalRecords = await db.$count(subscriptions, filters);
  const totalPages = limit ? Math.ceil(totalRecords / Number(limit)) : 1;

  return {
    currentPage: Number(page),
    totalRecords: totalRecords,
    totalPages: totalPages,
    currentLimit: Number(limit),
  };
};

export const getSubscriberById = async (subscriptionId: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const subscriberData = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.subscriptionId, subscriptionId),
    });
    if (!subscriberData) {
      return { success: false, message: "Subscriber not found" };
    }
    return { success: true, data: subscriberData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch subscriber" };
  }
};

export const getSubscriptionsByPhone = async (phone: string) => {
  try {
    const data = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.isActive, true),
        ilike(subscriptions.phone, phone),
      ),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch subscriptions" };
  }
};

export const createSubscriber = async (prevState: any, formData: FormData) => {
  try {
    const validatedSubscriptionData = SubscriptionDataSchema.parse(
      Object.fromEntries(formData),
    );
    const walletNumber =
      "walletNumber" in validatedSubscriptionData
        ? validatedSubscriptionData.walletNumber
        : null;
    const transactionId =
      "transactionId" in validatedSubscriptionData
        ? validatedSubscriptionData.transactionId
        : null;
    const bankName =
      "bankName" in validatedSubscriptionData
        ? validatedSubscriptionData.bankName
        : null;
    const accountHolderName =
      "accountHolderName" in validatedSubscriptionData
        ? validatedSubscriptionData.accountHolderName
        : null;
    const accountNumber =
      "accountNumber" in validatedSubscriptionData
        ? validatedSubscriptionData.accountNumber
        : null;
    const branchName =
      "branchName" in validatedSubscriptionData
        ? validatedSubscriptionData.branchName
        : null;
    const restData = {
      name: validatedSubscriptionData.name,
      phone: validatedSubscriptionData.phone,
      streetAddress: validatedSubscriptionData.streetAddress,
      district: validatedSubscriptionData.district,
      policeStation: validatedSubscriptionData.policeStation,
      postOffice: validatedSubscriptionData.postOffice,
      subscriptionDuration: validatedSubscriptionData.subscriptionDuration,
      subscriptionType: validatedSubscriptionData.subscriptionType,
      batteryType: validatedSubscriptionData.batteryType,
      ipsBrand: validatedSubscriptionData.ipsBrand,
      ipsPowerRating: validatedSubscriptionData.ipsPowerRating,
      paymentType: validatedSubscriptionData.paymentType,
    };

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      headersList.get("remote-addr") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const subscriptionId = generateRandomId();
    let applicationId;

    const pkgBasePrice = subscriptionPlans[restData.subscriptionType];
    const pkgDuration = restData.subscriptionDuration;
    const match = restData.ipsPowerRating?.match(/(\d+)\s*Volt/i);
    const volt = match ? match[1] : null;
    const surcharge = volt
      ? voltSurcharges[volt as keyof typeof voltSurcharges]
      : 0;
    const discount =
      discounts[pkgDuration.toString() as keyof typeof discounts];
    const monthlyTotalAmount = (pkgBasePrice + surcharge) * pkgDuration;
    const totalAmount = monthlyTotalAmount - discount;

    await db.insert(subscriptions).values({
      subscriptionId: subscriptionId,
      basePrice: pkgBasePrice,
      surchargeAmount: surcharge,
      discountAmount: discount,
      totalFee: totalAmount,
      ...restData,
      walletNumber: walletNumber,
      transactionId: transactionId,
      bankInfo: bankName
        ? {
            bankName: bankName,
            accountHolderName: accountHolderName as string,
            accountNumber: accountNumber as string,
            branchName: branchName as string,
          }
        : null,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    const res = await createApplication({
      applicantId: subscriptionId,
      type: "subscription_application",
    });

    if (res.success) {
      applicationId = res.data;
    }

    if (applicationId) {
      // Sending SMSs
      const fullMessage = renderText(ApplicationMessages.subscription.SUBMISSION, {
        applicant_name: restData.name,
        subscription_id: subscriptionId,
        tracking_link: generateUrl("application-tracking", {
          trackingId: applicationId,
        }),
      });

      const { notifyCustomer } = await import("./notificationActions");
      const { customers } = await import("@/db/schema");

      // Try to find if they are a registered customer
      const customerRecord = await db.query.customers.findFirst({
        where: eq(customers.phone, restData.phone),
      });

      const promises = [
        sendSMS(
            process.env.ADMIN_PHONE_NUMBER!,
            ApplicationMessages.subscription.ADMIN_NOTIF,
        ),
      ];

      if (customerRecord) {
        const shortSMS = `প্রিয় {applicant_name}, আপনার সাবস্ক্রিপশন আবেদনটি (ID: {subscription_id}) জমা হয়েছে। বিস্তারিত দেখুন ড্যাশবোর্ডে।`;
        promises.push(notifyCustomer({
          customerId: customerRecord.customerId,
          phoneNumber: restData.phone,
          type: "subscription_submission",
          message: fullMessage,
          shortMessage: renderText(shortSMS, { applicant_name: restData.name, subscription_id: subscriptionId }),
          link: "/customer/profile",
        }));
      } else {
        promises.push(sendSMS(restData.phone, fullMessage));
      }

      await Promise.all(promises);
    } else {
      console.error("applicationId does not exists");
    }

    return { success: true, message: "Subscription created" };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(flattenError(error).fieldErrors);
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const updateSubscriber = async (prevState: any, formData: FormData) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const subscriptionId = formData.get("subscriptionId");
    if (!subscriptionId) {
      return { success: false, message: "Subscription not found" };
    }

    formData.delete("subscriptionId");
    const validatedSubscriptionData = SubscriptionDataSchema.parse(
      Object.fromEntries(formData),
    );
    const walletNumber =
      "walletNumber" in validatedSubscriptionData
        ? validatedSubscriptionData.walletNumber
        : null;
    const transactionId =
      "transactionId" in validatedSubscriptionData
        ? validatedSubscriptionData.transactionId
        : null;
    const bankName =
      "bankName" in validatedSubscriptionData
        ? validatedSubscriptionData.bankName
        : null;
    const accountHolderName =
      "accountHolderName" in validatedSubscriptionData
        ? validatedSubscriptionData.accountHolderName
        : null;
    const accountNumber =
      "accountNumber" in validatedSubscriptionData
        ? validatedSubscriptionData.accountNumber
        : null;
    const branchName =
      "branchName" in validatedSubscriptionData
        ? validatedSubscriptionData.branchName
        : null;
    const restData = {
      name: validatedSubscriptionData.name,
      phone: validatedSubscriptionData.phone,
      streetAddress: validatedSubscriptionData.streetAddress,
      district: validatedSubscriptionData.district,
      policeStation: validatedSubscriptionData.policeStation,
      postOffice: validatedSubscriptionData.postOffice,
      subscriptionDuration: validatedSubscriptionData.subscriptionDuration,
      subscriptionType: validatedSubscriptionData.subscriptionType,
      batteryType: validatedSubscriptionData.batteryType,
      ipsBrand: validatedSubscriptionData.ipsBrand,
      ipsPowerRating: validatedSubscriptionData.ipsPowerRating,
      paymentType: validatedSubscriptionData.paymentType,
    };

    const pkgBasePrice = subscriptionPlans[restData.subscriptionType];
    const pkgDuration = restData.subscriptionDuration;
    const match = restData.ipsPowerRating?.match(/(\d+)\s*Volt/i);
    const volt = match ? match[1] : null;
    const surcharge = volt
      ? voltSurcharges[volt as keyof typeof voltSurcharges]
      : 0;
    const discount =
      discounts[pkgDuration.toString() as keyof typeof discounts];
    const monthlyTotalAmount = (pkgBasePrice + surcharge) * pkgDuration;
    const totalAmount = monthlyTotalAmount - discount;

    await db
      .update(subscriptions)
      .set({
        basePrice: pkgBasePrice,
        surchargeAmount: surcharge,
        discountAmount: discount,
        totalFee: totalAmount,
        ...restData,
        walletNumber: walletNumber,
        transactionId: transactionId,
        bankInfo: bankName
          ? {
              bankName: bankName,
              accountHolderName: accountHolderName as string,
              accountNumber: accountNumber as string,
              branchName: branchName as string,
            }
          : null,
      })
      .where(eq(subscriptions.id, subscriptionId.toString()));

    revalidatePath("/subscribers");
    return { success: true, message: "Subscription updated" };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(flattenError(error).fieldErrors);
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const deleteSubscriber = async (subscriptionId: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    await db.transaction(async (tx) => {
      await tx
        .delete(subscriptions)
        .where(eq(subscriptions.subscriptionId, subscriptionId));
      await tx
        .delete(applications)
        .where(eq(applications.applicantId, subscriptionId));
    });
    revalidatePath("/subscribers");
    return { success: true, message: "Subscription deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};
