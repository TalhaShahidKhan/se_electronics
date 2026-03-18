"use server";

import { ApplicationMessages, ServiceMessages } from "@/constants/messages";
import { db } from "@/db/drizzle";
import {
  applications,
  products,
  serviceStatusHistory,
  services,
  tasks,
} from "@/db/schema";
import { SMSError, sendEmail, sendSMS, verifySession } from "@/lib";
import { deleteObject, getObjectUrl, putObject } from "@/lib/s3";
import { compressImage } from "@/lib/sharp";
import { SearchParams } from "@/types";
import { generateRandomId, generateUrl, renderText } from "@/utils";
import {
  AddToServiceSchema,
  AppointmentDataSchema,
  ServiceDataSchema,
  ServiceReportDataSchema,
  UpdateServiceDataSchema,
} from "@/validationSchemas";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import z, { ZodError, flattenError } from "zod";
import { createApplication } from "./applicationActions";
import { updateStaffStats } from "./staffActions";

export const getServices = async ({
  query,
  page = "1",
  limit = "20",
  type,
  staffId,
}: SearchParams & { type?: "repair" | "install"; staffId?: string }) => {
  try {
    const session = await verifySession(false);
    if (!session || (session.role !== "admin" && session.role !== "staff")) {
      return { success: false, message: "Unauthorized" };
    }
    const q = `%${query}%`;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;

    const whereFilters = [
      eq(services.isActive, true),
      type ? eq(services.type, type) : undefined,
      staffId ? eq(services.staffId, staffId) : undefined,
      query
        ? or(
            ilike(services.serviceId, q),
            ilike(services.customerId, q),
            ilike(services.customerName, q),
            ilike(services.customerPhone, q),
            ilike(services.customerAddress, q),
            ilike(services.productModel, q),
          )
        : undefined,
    ].filter(Boolean);

    const servicesData = await db.query.services.findMany({
      where: and(...whereFilters as any),
      with: {
        statusHistory: {
          columns: {
            createdAt: false,
            updatedAt: false,
            serviceId: false,
          },
          limit: 1,
          orderBy: (statusHistory, { desc }) => [desc(statusHistory.createdAt)],
        },
      },
      limit: limit ? Number(limit) : undefined,
      offset: offset,
      orderBy: (services, { desc }) => [desc(services.createdAt)],
    });
    return { success: true, data: servicesData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getServicesMetadata = async ({
  query,
  page = "1",
  limit = "20",
  type,
  staffId,
}: SearchParams & { type?: "repair" | "install"; staffId?: string }) => {
  const q = `%${query}%`;
  const filters = and(
    eq(services.isActive, true),
    type ? eq(services.type, type) : undefined,
    staffId ? eq(services.staffId, staffId) : undefined,
    query
      ? or(
          ilike(services.serviceId, q),
          ilike(services.customerId, q),
          ilike(services.customerName, q),
          ilike(services.customerPhone, q),
          ilike(services.customerAddress, q),
          ilike(services.productModel, q),
        )
      : undefined,
  );

  const totalRecords = await db.$count(services, filters);
  const totalPages = limit ? Math.ceil(totalRecords / Number(limit)) : 1;

  return {
    currentPage: Number(page),
    totalRecords: totalRecords,
    totalPages: totalPages,
    currentLimit: Number(limit),
  };
};

export const getServiceById = async (serviceId: string) => {
  try {
    const session = await verifySession(false);
    if (!session) return { success: false, message: "Unauthorized" };

    const serviceData = await db.query.services.findFirst({
      where: eq(services.serviceId, serviceId),
      with: {
        statusHistory: {
          columns: {
            updatedAt: false,
            serviceId: false,
          },
          orderBy: (statusHistory, { desc, asc }) => [
            asc(statusHistory.createdAt),
          ],
        },
        appointedStaff: {
          columns: {
            staffId: true,
            photoKey: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!serviceData) return { success: false, message: "Service not found" };

    // Prevent customers from viewing others' services
    if (
      session.role === "customer" &&
      serviceData.customerId !== session.userId
    ) {
      return { success: false, message: "Unauthorized access to service" };
    }

    const mediaKeys = [
      serviceData.productFrontPhotoKey,
      serviceData.productBackPhotoKey,
      serviceData.warrantyCardPhotoKey,
      serviceData.appointedStaff?.photoKey,
    ].filter(Boolean) as string[];

    const mediaUrls = await Promise.all(
      mediaKeys.map((key) => getObjectUrl(key))
    );

    const mediaMap: Record<string, string> = {};
    mediaKeys.forEach((key, i) => {
      mediaMap[key] = mediaUrls[i];
    });

    const data = {
      ...serviceData,
      productFrontPhotoUrl: serviceData.productFrontPhotoKey ? mediaMap[serviceData.productFrontPhotoKey] : null,
      productBackPhotoUrl: serviceData.productBackPhotoKey ? mediaMap[serviceData.productBackPhotoKey] : null,
      warrantyCardPhotoUrl: serviceData.warrantyCardPhotoKey ? mediaMap[serviceData.warrantyCardPhotoKey] : null,
      appointedStaff: serviceData.appointedStaff ? {
        ...serviceData.appointedStaff,
        photoUrl: mediaMap[serviceData.appointedStaff.photoKey] || null,
      } : null,
    };

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getServiceHistoryById = async (id: string) => {
  try {
    const session = await verifySession(false);
    if (!session) return { success: false, message: "Unauthorized" };

    if (session.role === "customer" && session.userId !== id) {
      return { success: false, message: "Unauthorized access" };
    }

    const serviceData = await db.query.services.findMany({
      where: or(
        and(eq(services.staffId, id), eq(services.resolvedBy, "staff_member")),
        eq(services.customerId, id),
      ),
      columns: {
        id: true,
        serviceId: true,
        customerId: true,
        customerName: true,
        staffId: true,
        staffName: true,
        staffPhone: true,
        customerAddress: true,
        customerAddressDistrict: true,
        type: true,
        productType: true,
        productModel: true,
        ipsBrand: true,
        createdAt: true,
      },
      with: {
        statusHistory: {
          columns: {
            status: true,
            statusType: true,
          },
          limit: 1,
          orderBy: (statusHistory, { desc }) => [desc(statusHistory.createdAt)],
        },
        appointedStaff: {
          columns: {
            staffId: true,
            name: true,
            phone: true,
            rating: true,
          },
        },
      },
      orderBy: (services, { desc }) => [desc(services.createdAt)],
    });
    return { success: true, data: serviceData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Cannot fetch service history" };
  }
};

export const getServiceMediaUrls = async (keys: string[]) => {
  try {
    const mediaData = await Promise.all(keys.map((key) => getObjectUrl(key)));
    return { success: true, data: mediaData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch media" };
  }
};

export async function createService(prevState: any, formData: FormData) {
  try {
    const entries = Object.fromEntries(formData);
    // Convert empty strings to null for ID fields to avoid FK constraint violations
    if (entries.staffId === "") entries.staffId = null as any;
    if (entries.customerId === "") entries.customerId = null as any;

    const validatedCustomerData = ServiceDataSchema.parse(entries);
    const {
      productFrontPhoto,
      productBackPhoto,
      warrantyCardPhoto,
      ...serviceData
    } = validatedCustomerData;

    const serviceId = generateRandomId();
    let ipAddress: string;
    let userAgent: string;
    let applicationId: string = "";
    let productFrontPhotoKey: string;
    let productBackPhotoKey: string;
    let warrantyCardPhotoKey: string;

    const includesMedia = !!(
      productFrontPhoto &&
      productBackPhoto &&
      warrantyCardPhoto
    );
    const originSource = includesMedia ? "public_form" : "dashboard";

    if (originSource === "dashboard") {
      const session = await verifySession(false);
      if (
        !session ||
        (session.role !== "admin" && session.role !== "customer")
      ) {
        return { success: false, message: "Unauthorized" };
      }
    }

    if (includesMedia) {
      const mimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (
        !mimeTypes.includes(validatedCustomerData.productFrontPhoto!.type) ||
        !mimeTypes.includes(validatedCustomerData.productBackPhoto!.type) ||
        !mimeTypes.includes(validatedCustomerData.warrantyCardPhoto!.type) ||
        productFrontPhoto?.size === 0 ||
        productBackPhoto?.size === 0 ||
        warrantyCardPhoto?.size === 0
      ) {
        return { success: false, message: "Invalid file type" };
      }
    }

    await db.transaction(async (tx) => {
      if (includesMedia) {
        productFrontPhotoKey = `media/services/${serviceId}/product-front_${uuidv4()}.webp`;
        productBackPhotoKey = `media/services/${serviceId}/product-back_${uuidv4()}.webp`;
        warrantyCardPhotoKey = `media/services/${serviceId}/warranty-card_${uuidv4()}.webp`;

        const [
          productFrontPhotoBuffer,
          productBackPhotoBuffer,
          warrantyCardPhotoBuffer,
        ] = await Promise.all([
          compressImage(
            Buffer.from(await productFrontPhoto.arrayBuffer()),
            "product",
          ),
          compressImage(
            Buffer.from(await productBackPhoto.arrayBuffer()),
            "product",
          ),
          compressImage(
            Buffer.from(await warrantyCardPhoto.arrayBuffer()),
            "warranty",
          ),
        ]);

        await Promise.all([
          putObject({
            Key: productFrontPhotoKey,
            Body: productFrontPhotoBuffer,
            ContentType: "image/webp",
          }),
          putObject({
            Key: productBackPhotoKey,
            Body: productBackPhotoBuffer,
            ContentType: "image/webp",
          }),
          putObject({
            Key: warrantyCardPhotoKey,
            Body: warrantyCardPhotoBuffer,
            ContentType: "image/webp",
          }),
        ]);
      }

      if (originSource === "public_form") {
        const res = await createApplication(
          {
            applicantId: serviceId,
            type: "service_application",
          },
          tx,
        );

        applicationId = res.data!;

        const headersList = await headers();
        ipAddress =
          headersList.get("x-forwarded-for") ||
          headersList.get("x-real-ip") ||
          headersList.get("remote-addr") ||
          "unknown";
        userAgent = headersList.get("user-agent") || "unknown";
      }

      await tx.insert(services).values({
        ...serviceData,
        serviceId: serviceId,
        createdFrom: originSource,
        // Services created from both dashboard and public form
        // should appear in the admin list
        isActive: true,
        ipAddress: ipAddress,
        userAgent: userAgent,
        productBackPhotoKey,
        productFrontPhotoKey,
        warrantyCardPhotoKey,
      });

      await tx.insert(serviceStatusHistory).values({
        serviceId: serviceId,
        status: "pending",
      });
    });

    // Revalidate service lists for admin and customer
    revalidatePath("/services/repairs");
    revalidatePath("/services/installations");
    revalidatePath("/customer/services");

    if (originSource === "public_form") {
      // Sending applicant and the admin SMS of the online applicatoin if the form is submitted from public form
      await Promise.all([
        sendSMS(
          validatedCustomerData.customerPhone,
          renderText(ApplicationMessages.service.SUBMISSION, {
            applicant_name: validatedCustomerData.customerName,
            service_id: serviceId,
            tracking_link: generateUrl("application-tracking", {
              trackingId: applicationId,
            }),
          }),
        ),
        sendSMS(
          process.env.ADMIN_PHONE_NUMBER!,
          ApplicationMessages.service.ADMIN_NOTIF,
        ),
      ]);
    } else if (originSource === "dashboard") {
      // Else this form is created from the dashboard so send a SMS to the customer with service status tracking link
      const fullMessage = renderText(ServiceMessages.CONFIRMATION, {
        customer_name: validatedCustomerData.customerName,
        service_id: serviceId,
        tracking_link: generateUrl("service-tracking", {
          trackingId: serviceId,
        }),
      });
      
      const shortSMS = renderText(
         `প্রিয় গ্রাহক {customer_name}, আপনার সার্ভিস অনুরোধটি (ID: {service_id}) গ্রহণ করা হয়েছে। বিস্তারিত দেখুন: {tracking_link}`,
         {
           customer_name: validatedCustomerData.customerName,
           service_id: serviceId,
           tracking_link: generateUrl("service-tracking", { trackingId: serviceId }),
         }
      );

      if (validatedCustomerData.customerId) {
        const { notifyCustomer } = await import("./notificationActions");
        await notifyCustomer({
          customerId: validatedCustomerData.customerId,
          phoneNumber: validatedCustomerData.customerPhone,
          type: "service_confirmation",
          message: fullMessage,
          shortMessage: shortSMS,
          link: `/customer/services/${serviceId}`,
        });
      } else {
        await sendSMS(validatedCustomerData.customerPhone, fullMessage);
      }
    }

    return { success: true, message: "Added to service list" };
  } catch (error) {
    console.error("createService error caught:", error);
    if (error instanceof z.ZodError) {
      console.error(
        "Zod Validation Errors:",
        z.flattenError(error).fieldErrors,
      );
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }
    console.error(error);
    let message =
      error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message };
  }
}

export async function addToService(data: z.infer<typeof AddToServiceSchema>) {
  try {
    const validatedData = AddToServiceSchema.parse(data);
    const { productId, serviceType } = validatedData;

    const productInfo = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: {
        type: true,
        model: true,
      },
      with: {
        invoice: {
          columns: {
            customerId: true,
            customerName: true,
            customerPhone: true,
            customerAddress: true,
          },
        },
      },
    });

    if (!productInfo) {
      console.error("Product not found");
      return { success: false, message: "Product not found" };
    }

    const formData = new FormData();
    formData.append("customerId", productInfo.invoice.customerId);
    formData.append("customerName", productInfo.invoice.customerName);
    formData.append("customerPhone", productInfo.invoice.customerPhone);
    formData.append("customerAddress", productInfo.invoice.customerAddress);
    formData.append("productType", productInfo.type);
    formData.append("productModel", productInfo.model);
    formData.append("type", serviceType);

    return await createService(null, formData);
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
}

export const appointStaff = async (
  appointmentData: z.infer<typeof AppointmentDataSchema>,
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedData = AppointmentDataSchema.parse(appointmentData);

    await db.transaction(async (tx) => {
      await tx
        .update(services)
        .set({
          staffId: validatedData.staffId ? validatedData.staffId : null,
          staffName: validatedData.staffName,
          staffPhone: validatedData.staffPhone,
        })
        .where(eq(services.serviceId, validatedData.serviceId));

      await tx.insert(serviceStatusHistory).values({
        serviceId: validatedData.serviceId,
        status: "in_progress",
      });
    });

    const service = await db.query.services.findFirst({
      where: eq(services.serviceId, validatedData.serviceId),
      columns: { customerId: true },
    });

    const customerMessage = renderText(
      validatedData.serviceType === "install"
        ? ServiceMessages.CUSTOMER_INSTALL
        : ServiceMessages.CUSTOMER_REPAIR,
      {
        customer_name: validatedData.customerName,
        service_id: validatedData.serviceId,
      },
    );

    const staffMessage = renderText(
      validatedData.serviceType === "install"
        ? ServiceMessages.ELECTRICIAN_APPOINT
        : ServiceMessages.TECHNICIAN_APPOINT,
      {
        staff_name: validatedData.staffName,
        customer_name: validatedData.customerName,
        customer_phone: validatedData.customerPhone,
        service_id: validatedData.serviceId,
        product_model: validatedData.productModel,
        customer_address: validatedData.customerAddress,
        service_report_url: generateUrl("service-report", {
          serviceId: validatedData.serviceId,
        }),
      },
    );

    const { notifyCustomer, notifyStaff } = await import("./notificationActions");

    const promises: Promise<any>[] = [];

    // Notify Customer
    if (service?.customerId) {
      const shortCustomerSMS = renderText(
        `প্রিয় গ্রাহক {customer_name}, আপনার {service_id} সার্ভিসের জন্য আমাদের টিম নিযুক্ত করা হয়েছে। বিস্তারিত দেখুন: {tracking_link}`,
        {
          customer_name: validatedData.customerName,
          service_id: validatedData.serviceId,
          tracking_link: generateUrl("service-tracking", { trackingId: validatedData.serviceId }),
        }
      );
      promises.push(notifyCustomer({
        customerId: service.customerId,
        phoneNumber: validatedData.customerPhone,
        type: "staff_appointed",
        message: customerMessage,
        shortMessage: shortCustomerSMS,
        link: `/customer/services/${validatedData.serviceId}`,
      }));
    } else {
      promises.push(sendSMS(validatedData.customerPhone, customerMessage));
    }

    // Notify Staff
    if (validatedData.staffId) {
      // 1. Create a task for the staff member
      await db.insert(tasks).values({
        taskId: generateRandomId(),
        staffId: validatedData.staffId,
        title: validatedData.serviceType === "install" ? "ইন্সটলেশন কাজ" : "সার্ভিসিং কাজ",
        description: staffMessage,
        priority: "normal",
        status: "pending",
      });

      // 2. Send a short SMS and notification
      const shortStaffSMS = `নতুন সার্ভিস নিয়োগ করা হয়েছে (ID: ${validatedData.serviceId})। বিস্তারিত আপনার ড্যাশবোর্ডে দেখুন।`;
      promises.push(notifyStaff({
        staffId: validatedData.staffId,
        phoneNumber: validatedData.staffPhone,
        type: "service_appointed",
        message: staffMessage,
        shortMessage: shortStaffSMS,
        link: `/staff/tasks`, // Updated link to point to tasks page
      }));
    } else {
      promises.push(sendSMS(validatedData.staffPhone, staffMessage));
    }

    await Promise.all(promises);

    revalidatePath("/services");
    revalidatePath("/installations");
    revalidatePath("/staff/tasks"); // Added revalidation for staff tasks page

    return { success: true, message: "Appointed" };
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

export const updateService = async (
  formData: FormData,
  serviceId: string,
  statusId?: string,
) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const validatedData = UpdateServiceDataSchema.parse(
      Object.fromEntries(formData),
    );
    const {
      serviceStatus,
      customLabel,
      customNote,
      cancelReason,
      sendCompletionSMS,
      warrantyCardPhoto,
      productFrontPhoto,
      productBackPhoto,
      ...restData
    } = validatedData;

    const currentServiceStatus = (
      await db.query.serviceStatusHistory.findFirst({
        where: eq(serviceStatusHistory.serviceId, serviceId),
        orderBy: desc(serviceStatusHistory.createdAt),
      })
    )?.status;

    const serviceData = await db
      .update(services)
      .set({
        ...restData,
        ...(serviceStatus !== currentServiceStatus && {
          resolvedBy: serviceStatus === "completed" ? "service_center" : null,
        }),
      })
      .where(eq(services.serviceId, serviceId))
      .returning({
        type: services.type,
        warrantyCardPhotoKey: services.warrantyCardPhotoKey,
        productFrontPhotoKey: services.productFrontPhotoKey,
        productBackPhotoKey: services.productBackPhotoKey,
      });

    if (serviceStatus === "pending") {
      await db
        .delete(serviceStatusHistory)
        .where(eq(serviceStatusHistory.serviceId, serviceId));
    } else {
      await db
        .delete(serviceStatusHistory)
        .where(
          and(
            eq(serviceStatusHistory.serviceId, serviceId),
            or(
              eq(serviceStatusHistory.status, "completed"),
              eq(serviceStatusHistory.status, "canceled"),
            ),
          ),
        );
    }

    switch (serviceStatus) {
      // maybe we can use upsert here?
      case "new_note": {
        await db.insert(serviceStatusHistory).values({
          serviceId: serviceId,
          statusType: "custom",
          customLabel: customLabel,
          customNote: customNote,
        });
        break;
      }
      case "custom": {
        await db
          .update(serviceStatusHistory)
          .set({
            customLabel: customLabel,
            customNote: customNote,
          })
          .where(eq(serviceStatusHistory.id, statusId!));
        break;
      }
      default: {
        await db.insert(serviceStatusHistory).values({
          serviceId: serviceId,
          status: serviceStatus,
          ...(serviceStatus === "canceled" && cancelReason
            ? { cancelReason: cancelReason }
            : {}),
        });
        break;
      }
    }

    // Send completion SMS if admin wants it
    if (sendCompletionSMS) {
      const fullMessage = renderText(
        serviceData[0].type === "install"
          ? ServiceMessages.COMPLETION_INSTALL
          : ServiceMessages.COMPLETION_REPAIR,
        {
          customer_name: restData.customerName,
          service_id: serviceId,
          feedback_url: generateUrl("feedback", { serviceId: serviceId }),
        },
      );

      const serviceRecord = await db.query.services.findFirst({
        where: eq(services.serviceId, serviceId),
        columns: { customerId: true },
      });

      if (serviceRecord?.customerId) {
        const { notifyCustomer } = await import("./notificationActions");
        const shortSMS = renderText(
          `প্রিয় গ্রাহক {customer_name}, আপনার সার্ভিসটি (ID: {service_id}) সম্পন্ন হয়েছে। আপনার মূল্যবান ফিডব্যাক দিন: {feedback_url}`,
          {
            customer_name: restData.customerName,
            service_id: serviceId,
            feedback_url: generateUrl("feedback", { serviceId: serviceId }),
          }
        );
        await notifyCustomer({
          customerId: serviceRecord.customerId,
          phoneNumber: restData.customerPhone,
          type: "service_completed",
          message: fullMessage,
          shortMessage: shortSMS,
          link: `/customer/services/${serviceId}`,
        });
      } else {
        await sendSMS(restData.customerPhone, fullMessage);
      }
    }

    // Updating images if there is any
    const promisesArray = [];
    const mimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (
      warrantyCardPhoto &&
      mimeTypes.includes(warrantyCardPhoto.type) &&
      warrantyCardPhoto.size > 0
    ) {
      const warrantyCardPhotoBuffer = Buffer.from(
        await warrantyCardPhoto.arrayBuffer(),
      );
      promisesArray.push(
        putObject({
          Key: serviceData[0].warrantyCardPhotoKey!,
          Body: warrantyCardPhotoBuffer,
          ContentType: warrantyCardPhoto.type,
        }),
      );
    }

    if (
      productFrontPhoto &&
      mimeTypes.includes(productFrontPhoto.type) &&
      productFrontPhoto.size > 0
    ) {
      const productFrontPhotoBuffer = Buffer.from(
        await productFrontPhoto.arrayBuffer(),
      );
      promisesArray.push(
        putObject({
          Key: serviceData[0].productFrontPhotoKey!,
          Body: productFrontPhotoBuffer,
          ContentType: productFrontPhoto.type,
        }),
      );
    }

    if (
      productBackPhoto &&
      mimeTypes.includes(productBackPhoto.type) &&
      productBackPhoto.size > 0
    ) {
      const productBackPhotoBuffer = Buffer.from(
        await productBackPhoto.arrayBuffer(),
      );
      promisesArray.push(
        putObject({
          Key: serviceData[0].productBackPhotoKey!,
          Body: productBackPhotoBuffer,
          ContentType: productBackPhoto.type,
        }),
      );
    }

    await Promise.all(promisesArray);

    // Update staff stats if service status changed to completed or canceled
    if (serviceStatus === "completed" || serviceStatus === "canceled") {
      const service = await db.query.services.findFirst({
        where: eq(services.serviceId, serviceId),
        columns: { staffId: true },
      });
      if (service?.staffId) {
        // Update in background, don't block response
        updateStaffStats(service.staffId).catch((err) =>
          console.error("Failed to update staff stats:", err),
        );
      }
    }

    revalidatePath("/services");
    revalidatePath("/installations");

    return { success: true, message: "Service Updated" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(z.flattenError(error).fieldErrors);
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }
    console.error(error);
    return { success: false, message: "Could not update service" };
  }
};

export const reportService = async ({
  serviceStatus,
  serviceReport,
  messageData,
}: z.infer<typeof ServiceReportDataSchema>) => {
  try {
    const session = await verifySession(false, "staff");
    if (!session) return { success: false, message: "Unauthorized" };

    await db.insert(serviceStatusHistory).values(serviceStatus);

    if (serviceReport) {
      await db
        .update(services)
        .set({
          staffReport: serviceReport,
          ...(serviceReport.resolved && { resolvedBy: "staff_member" }),
        })
        .where(eq(services.serviceId, serviceStatus.serviceId));

      await sendEmail({
        from: `New Technician Comment`,
        subject: "Technician Comment Notification",
        text: `A comment was added to your dashboard by a Technician.\nView Comment: ${process.env.NEXT_PUBLIC_BASE_URL}/services`,
      });
    }

    if (messageData) {
      const messageContent = renderText(
        messageData.messageType === "install"
          ? ServiceMessages.COMPLETION_INSTALL
          : ServiceMessages.COMPLETION_REPAIR,
        {
          customer_name: messageData.customerName,
          service_id: serviceStatus.serviceId,
          feedback_url: generateUrl("feedback", {
            serviceId: serviceStatus.serviceId,
          }),
        },
      );
      await sendSMS(messageData.customerPhone, messageContent);
    }

    return { success: true, message: "Service Reported Successfully" };
  } catch (error) {
    console.error(error);
    let message = "Something went wrong";
    if (error instanceof SMSError) {
      message = error.message;
    }
    return { success: false, message };
  }
};

export async function deleteService(serviceId: string) {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    await db.transaction(async (tx) => {
      const serviceData = await tx
        .delete(services)
        .where(eq(services.serviceId, serviceId))
        .returning({
          createdFrom: services.createdFrom,
          productFrontPhotoKey: services.productFrontPhotoKey,
          productBackPhotoKey: services.productBackPhotoKey,
          warrantyCardPhotoKey: services.warrantyCardPhotoKey,
        });

      await tx
        .delete(applications)
        .where(eq(applications.applicantId, serviceId));

      if (serviceData[0].createdFrom === "public_form") {
        await Promise.all([
          deleteObject({ Key: serviceData[0].productFrontPhotoKey! }),
          deleteObject({ Key: serviceData[0].productBackPhotoKey! }),
          deleteObject({ Key: serviceData[0].warrantyCardPhotoKey! }),
        ]);
      }
    });
    revalidatePath("/services");
    revalidatePath("/installations");
    return { success: true, message: "Service deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}
