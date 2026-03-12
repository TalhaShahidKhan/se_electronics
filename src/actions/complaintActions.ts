"use server";

import { db } from "@/db/drizzle";
import { staffComplaints } from "@/db/schema";
import { generateRandomId } from "@/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyCustomerSession } from "@/actions/customerActions";

const ComplaintSchema = z.object({
  customerId: z.string().min(1),
  staffId: z.string().min(1),
  serviceId: z.preprocess((val) => (val === "" ? undefined : val), z.string().optional()),
  subject: z.string().min(1),
  description: z.string().min(1),
});

export async function submitComplaint(_prevState: any, formData: FormData) {
  try {
    const session = await verifyCustomerSession();
    if (!session.isAuth || !session.customer) {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = Object.fromEntries(formData);
    const validated = ComplaintSchema.parse(rawData);
    if (validated.customerId !== session.customer.customerId) {
      return { success: false, message: "Unauthorized" };
    }
    const complaintId = generateRandomId();

    const { adminNotifications, customers, staffs } = await import("@/db/schema");
    const { contactDetails } = await import("@/constants");
    const { sendSMS } = await import("@/lib");

    await db.transaction(async (tx) => {
      // 1. Verify serviceId if provided
      if (validated.serviceId) {
        const serviceExists = await tx.query.services.findFirst({
          where: (s, { eq }) => eq(s.serviceId, validated.serviceId as string),
        });
        if (!serviceExists) {
          throw new Error("INVALID_SERVICE_ID");
        }
      }

      // 2. Insert the complaint
      await tx.insert(staffComplaints).values({
        complaintId: complaintId,
        ...validated,
      });

      // 2. Fetch customer and staff info for notification
      const customer = await tx.query.customers.findFirst({
        where: (c, { eq }) => eq(c.customerId, validated.customerId),
      });
      const staff = await tx.query.staffs.findFirst({
        where: (s, { eq }) => eq(s.staffId, validated.staffId),
      });

      // 3. Create admin notification
      await tx.insert(adminNotifications).values({
        type: "complaint",
        message: `New complaint (${complaintId}) filed by ${customer?.name} against ${staff?.name}.`,
        link: `/complaints`,
      });

      // 4. Send SMS to admin
      const adminSMS = `New Complaint Alert!\nID: ${complaintId}\nCustomer: ${customer?.name}\nStaff: ${staff?.name}\nSubject: ${validated.subject}\nCheck dashboard for details.`;
      await sendSMS(contactDetails.sms, adminSMS);
    });

    revalidatePath("/customer/profile");
    revalidatePath("/customer/complain/history");
    revalidatePath("/complaints");
    
    return {
      success: true,
      data: complaintId,
      message: "Complaint submitted successfully. Admin will review it.",
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.issues);
      return { success: false, message: "Please fill all required fields." };
    }
    if (error instanceof Error && error.message === "INVALID_SERVICE_ID") {
      return { success: false, message: "সার্ভিস আইডিটি সঠিক নয়। অনুগ্রহ করে সঠিক আইডি দিন অথবা খালি রাখুন।" };
    }
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}




export async function getComplaintsByCustomer(customerId: string) {
  try {
    const data = await db.query.staffComplaints.findMany({
      where: (complaints, { eq }) => eq(complaints.customerId, customerId),
      with: {
        staff: true,
        service: true,
      },
      orderBy: (complaints, { desc }) => [desc(complaints.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch complaints" };
  }
}

export async function getAllComplaints() {
  try {
    const data = await db.query.staffComplaints.findMany({
      with: {
        customer: true,
        staff: true,
        service: true,
      },
      orderBy: (complaints, { desc }) => [desc(complaints.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch complaints" };
  }
}

export async function resolveComplaint(complaintId: string, adminNote: string) {
  try {
    const { eq } = await import("drizzle-orm");
    await db
      .update(staffComplaints)
      .set({
        status: "resolved",
        adminNote,
        updatedAt: new Date(),
      })
      .where(eq(staffComplaints.complaintId, complaintId));

    revalidatePath("/complaints");
    return { success: true, message: "Complaint resolved successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not resolve complaint" };
  }
}

export async function getComplaintById(complaintId: string) {
  try {
    const data = await db.query.staffComplaints.findFirst({
      where: (complaints, { eq }) => eq(complaints.complaintId, complaintId),
      with: {
        customer: true,
        staff: true,
        service: true,
      },
    });
    if (!data) return { success: false, message: "Complaint not found" };
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch complaint" };
  }
}

