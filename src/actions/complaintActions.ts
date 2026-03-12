"use server";

import { db } from "@/db/drizzle";
import { staffComplaints } from "@/db/schema";
import { generateRandomId } from "@/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ComplaintSchema = z.object({
  customerId: z.string().min(1),
  staffId: z.string().min(1),
  serviceId: z.string().optional(),
  subject: z.string().min(1),
  description: z.string().min(1),
});

export async function submitComplaint(_prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validated = ComplaintSchema.parse(rawData);

    await db.insert(staffComplaints).values({
      complaintId: generateRandomId(),
      ...validated,
    });
    revalidatePath("/customer/profile");
    return {
      success: true,
      message: "Complaint submitted successfully. Admin will review it.",
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.issues);
      return { success: false, message: "Please fill all required fields." };
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
