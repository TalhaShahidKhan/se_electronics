"use server";

import { contactDetails } from "@/constants";
import {
  ApplicationMessages,
  MediaDownloadMessages,
} from "@/constants/messages";
import { db } from "@/db/drizzle";
import {
  agreements,
  applications,
  authTokens,
  feedbacks,
  payments,
  services,
  staffs,
  userAgreements,
} from "@/db/schema";
import {
  SMSError,
  createSession,
  decrypt,
  deleteSession,
  sendSMS,
  verifySession,
} from "@/lib";
import { deleteObject, getObjectUrl, putObject } from "@/lib/s3";
import { compressImage } from "@/lib/sharp";
import { CertificateData, SearchParams } from "@/types";
import { generateRandomId, generateUrl, renderText } from "@/utils";
import {
  LoginCredentialsSchema,
  StaffDataSchema,
  UpdateStaffDataSchema,
} from "@/validationSchemas";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import z, { ZodError, flattenError } from "zod";
// import { createApplication } from "./applicationActions";
// import { deleteAuthToken, saveAuthToken, verifyAuthToken } from "./authActions";
import { deleteAuthToken, saveAuthToken, verifyAuthToken } from "./authActions";

export const sendRegistrationLink = async (phoneNumber: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    if (!phoneNumber) {
      return { success: false, message: "Phone number is required" };
    }

    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(
      Date.now() +
        parseInt(process.env.REGISTRATION_LINK_EXPIRY_DAY!) *
          24 *
          60 *
          60 *
          1000,
    );

    await db.insert(authTokens).values({ token, expiresAt });

    const registrationMessage = renderText(
      ApplicationMessages.staff.REG_INVITE,
      {
        registration_link: generateUrl("registration", { token }),
        registration_link_expiry: (
          parseInt(process.env.REGISTRATION_LINK_EXPIRY_DAY!) * 24
        ).toString(),
      },
    );
    await sendSMS(phoneNumber, registrationMessage);

    return { success: true, message: "Registration link sent" };
  } catch (error) {
    console.error(error);
    let message = "Something went wrong";
    if (error instanceof SMSError) {
      message = error.message;
    }
    return { success: false, message };
  }
};

export const sendIdCardDownloadLink = async (staffData: {
  phoneNumber: string;
  staffId: string;
  staffName: string;
  role: "technician" | "electrician";
}) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const { phoneNumber, staffId, staffName, role } = staffData;
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(
      Date.now() +
        parseInt(process.env.DOWNLOAD_LINK_EXPIRY_DAY!) * 24 * 60 * 60 * 1000,
    );
    const payload = {
      type: "id-card",
      id: staffId,
      issuedAt: new Date(),
    };

    await saveAuthToken({ token, expiresAt, payload });

    const message = renderText(
      role === "electrician"
        ? MediaDownloadMessages.ELECTRICIAN_ID_CARD
        : MediaDownloadMessages.TECHNICIAN_ID_CARD,
      {
        staff_name: staffName,
        download_link: generateUrl("id-card-download", { token }),
      },
    );

    const { notifyStaff } = await import("./notificationActions");
    await notifyStaff({
      staffId,
      phoneNumber,
      type: "id_card",
      message: message,
      shortMessage: `প্রিয় {staff_name}, আপনার আইডি কার্ড ডাউনলোড করার জন্য ড্যাশবোর্ডে লগইন করুন।`,
      link: "/staff/profile", // Or a specific link if available
    });

    return { success: true, message: "Download link sent" };
  } catch (error) {
    console.error(error);
    let message = "Something went wrong";
    if (error instanceof SMSError) {
      message = error.message;
    }
    return { success: false, message };
  }
};

export const sendCertificateLink = async (formData: FormData) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const rawData = Object.fromEntries(formData);
    const {
      staffId,
      memberNumber,
      shopName,
      shopId,
      ownerName,
      phone,
      address,
      district,
    } = rawData as CertificateData;

    if (!phone) return { success: false, message: "Phone number is required" };

    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(
      Date.now() +
        parseInt(process.env.DOWNLOAD_LINK_EXPIRY_DAY!) * 24 * 60 * 60 * 1000,
    );

    const payload = {
      type: "certificate",
      staffId,
      memberNumber,
      shopName,
      shopId,
      ownerName,
      phone,
      address,
      district,
    };
    await saveAuthToken({ token, expiresAt, payload });

    const message = renderText(MediaDownloadMessages.CERTIFICATE_DOWNLOAD, {
      shop_owner_name: ownerName,
      download_link: generateUrl("certificate-download", { token }),
    });

    const { notifyStaff } = await import("./notificationActions");
    await notifyStaff({
      staffId: staffId!,
      phoneNumber: phone,
      type: "certificate",
      message: message,
      shortMessage: `প্রিয় {ownerName}, আপনার সার্টিফিকেট ডাউনলোড করার জন্য ড্যাশবোর্ডে লগইন করুন।`,
      link: "/staff/profile",
    });

    return { success: true, message: "Certificate link sent" };
  } catch (error) {
    console.error(error);
    let message = "Something went wrong";
    if (error instanceof SMSError) {
      message = error.message;
    }
    return { success: false, message };
  }
};

export const getAllTeamMembers = async () => {
  try {
    // Public action for team page? No session check here if it's meant for public view.
    // However, it returns phone numbers. Careful.
    const staffsData = await db.query.staffs.findMany({
      where: eq(staffs.isVerified, true),
      columns: {
        id: true,
        staffId: true,
        name: true,
        phone: true,
        currentDistrict: true,
        currentPoliceStation: true,
        currentPostOffice: true,
        repairExperienceYears: true,
        installationExperienceYears: true,
        photoKey: true,
        nidFrontPhotoKey: true,
        nidBackPhotoKey: true,
        role: true,
      },
      orderBy: (staffs, { desc }) => [desc(staffs.createdAt)],
    });
    const finalStaffData = await Promise.all(
      staffsData.map(async (staff) => {
        const [photoUrl, nidFrontPhotoUrl, nidBackPhotoUrl] = await Promise.all(
          [
            getObjectUrl(staff.photoKey),
            getObjectUrl(staff.nidFrontPhotoKey),
            getObjectUrl(staff.nidBackPhotoKey),
          ],
        );
        return {
          ...staff,
          photoUrl,
          nidFrontPhotoUrl,
          nidBackPhotoUrl,
        };
      }),
    );
    return { success: true, data: finalStaffData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch staffs" };
  }
};

export const getStaffs = async ({
  query,
  page = "1",
  limit = "20",
  role,
}: SearchParams & { role?: "technician" | "electrician" }) => {
  try {
    const session = await verifySession(false);
    if (!session || (session.role !== "admin" && session.role !== "staff")) {
      return { success: false, message: "Unauthorized" };
    }

    const q = `%${query}%`;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;

    const staffsData = await db.query.staffs.findMany({
      where: and(
        eq(staffs.isVerified, true),
        role && eq(staffs.role, role),
        query
          ? or(
              ilike(staffs.staffId, q),
              ilike(staffs.name, q),
              ilike(staffs.phone, q),
              ilike(staffs.fatherName, q),
              ilike(staffs.currentDistrict, q),
            )
          : undefined,
      ),
      limit: limit ? Number(limit) : undefined,
      offset: offset,
      orderBy: (staffs, { desc }) => [desc(staffs.createdAt)],
    });

    const finalStaffData = await Promise.all(
      staffsData.map(async (staff) => {
        const [photoUrl, nidFrontPhotoUrl, nidBackPhotoUrl] = await Promise.all(
          [
            getObjectUrl(staff.photoKey),
            getObjectUrl(staff.nidFrontPhotoKey),
            getObjectUrl(staff.nidBackPhotoKey),
          ],
        );
        return {
          ...staff,
          photoUrl,
          nidFrontPhotoUrl,
          nidBackPhotoUrl,
        };
      }),
    );
    return { success: true, data: finalStaffData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch staffs" };
  }
};

export const getStaffsMetadata = async ({
  query,
  page = "1",
  limit = "20",
  role,
}: SearchParams & { role?: "technician" | "electrician" }) => {
  const q = `%${query}%`;
  const filters = and(
    eq(staffs.isVerified, true),
    role && eq(staffs.role, role),
    query
      ? or(
          ilike(staffs.staffId, q),
          ilike(staffs.name, q),
          ilike(staffs.phone, q),
          ilike(staffs.fatherName, q),
          ilike(staffs.currentDistrict, q),
        )
      : undefined,
  );

  const totalRecords = await db.$count(staffs, filters);
  const totalPages = limit ? Math.ceil(totalRecords / Number(limit)) : 1;

  return {
    currentPage: Number(page),
    totalRecords: totalRecords,
    totalPages: totalPages,
    currentLimit: Number(limit),
  };
};

export const getStaffById = async (staffId: string) => {
  try {
    const session = await verifySession(false);
    if (!session || (session.role !== "admin" && session.role !== "staff")) {
      return { success: false, message: "Unauthorized" };
    }

    const staffData = await db.query.staffs.findFirst({
      where: eq(staffs.staffId, staffId),
    });

    if (!staffData) return { success: false, message: "Staff not found" };

    const [photoUrl, nidFrontPhotoUrl, nidBackPhotoUrl] = await Promise.all([
      getObjectUrl(staffData.photoKey),
      getObjectUrl(staffData.nidFrontPhotoKey),
      getObjectUrl(staffData.nidBackPhotoKey),
    ]);

    return {
      success: true,
      data: { ...staffData, photoUrl, nidFrontPhotoUrl, nidBackPhotoUrl },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getStaffMediaUrls = async (keys: string[]) => {
  try {
    const session = await verifySession(false);
    if (!session || (session.role !== "admin" && session.role !== "staff")) {
      return { success: false, message: "Unauthorized" };
    }
    const mediaData = await Promise.all(keys.map((key) => getObjectUrl(key)));
    return { success: true, data: mediaData };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch media" };
  }
};

export const createStaff = async (_prevState: any, formData: FormData) => {
  try {
    const formDataObject = Object.fromEntries(formData);
    const validatedStaffData = StaffDataSchema.safeParse(formDataObject);

    if (!validatedStaffData.success) {
      console.error("Validation failed:", validatedStaffData.error.flatten());
      return {
        success: false,
        message: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।",
      };
    }

    const {
      photo,
      nidFrontPhoto,
      nidBackPhoto,
      agreed,
      token,
      sendConfirmationSMS,
      bankInfo,
      ...restStaffData
    } = validatedStaffData.data;

    const originSource = token ? "public_form" : "dashboard";

    if (originSource === "dashboard") {
      const session = await verifySession(false, "admin");
      if (!session) return { success: false, message: "Unauthorized" };
    }

    // Explicit file validation
    if (!(photo instanceof File) || photo.size === 0) {
      return { success: false, message: "প্রোফাইল ছবি আবশ্যক" };
    }
    if (!(nidFrontPhoto instanceof File) || nidFrontPhoto.size === 0) {
      return { success: false, message: "এনআইডি সামনের ছবি আবশ্যক" };
    }
    if (!(nidBackPhoto instanceof File) || nidBackPhoto.size === 0) {
      return { success: false, message: "এনআইডি পিছনের ছবি আবশ্যক" };
    }

    if (token) {
      if (!agreed)
        return {
          success: false,
          message: "Please agree to our terms and conditions",
        };
      const tokenInfo = await verifyAuthToken(token);
      if (!tokenInfo.isValid) {
        return { success: false, message: "Invalid or expired token" };
      }
    }

    const staffId = generateRandomId();
    const photoKey = `media/staff/${staffId}/profile_${uuidv4()}.webp`;
    const nidFrontPhotoKey = `media/staff/${staffId}/nid-front_${uuidv4()}.webp`;
    const nidBackPhotoKey = `media/staff/${staffId}/nid-back_${uuidv4()}.webp`;

    let applicationId: string | undefined;

    await db.transaction(async (tx) => {
      let ipAddress: string | null = null;
      let userAgent: string | null = null;

      if (originSource === "public_form") {
        const headersList = await headers();
        ipAddress =
          headersList.get("x-forwarded-for") ||
          headersList.get("x-real-ip") ||
          headersList.get("remote-addr") ||
          "unknown";
        userAgent = headersList.get("user-agent") || "unknown";
      }

      await tx.insert(staffs).values({
        ...restStaffData,
        staffId,
        photoKey,
        nidFrontPhotoKey,
        nidBackPhotoKey,
        bankInfo: bankInfo || null,
        walletNumber: restStaffData.walletNumber || null,
        docs: restStaffData.docs ? JSON.stringify(restStaffData.docs) : "[]",
        role: restStaffData.hasInstallationExperience
          ? "electrician"
          : "technician",
        isVerified: originSource !== "public_form",
        createdFrom: originSource,
        ipAddress,
        userAgent,
      } as typeof staffs.$inferInsert);

      if (originSource === "public_form") {
        const { createApplication } = await import("./applicationActions");
        const res = await createApplication({
          applicantId: staffId,
          type: "staff_application",
        });
        if (res.success) {
          applicationId = res.data;
        }

        const agreementId = await tx.query.agreements.findFirst({
          where: eq(agreements.isActive, true),
          columns: { id: true },
        });

        if (agreementId) {
          await tx.insert(userAgreements).values({
            userId: staffId,
            agreementId: agreementId.id,
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
          });
        }

        if (token) {
          await deleteAuthToken(token);
        }
      }
    });

    // Process and upload images after DB success
    const [photoBuffer, nidFrontPhotoBuffer, nidBackPhotoBuffer] =
      await Promise.all([
        compressImage(Buffer.from(await photo.arrayBuffer()), "portrait"),
        compressImage(Buffer.from(await nidFrontPhoto.arrayBuffer()), "nid"),
        compressImage(Buffer.from(await nidBackPhoto.arrayBuffer()), "nid"),
      ]);

    await Promise.all([
      putObject({ Key: photoKey, Body: photoBuffer, ContentType: "image/webp" }),
      putObject({
        Key: nidFrontPhotoKey,
        Body: nidFrontPhotoBuffer,
        ContentType: "image/webp",
      }),
      putObject({
        Key: nidBackPhotoKey,
        Body: nidBackPhotoBuffer,
        ContentType: "image/webp",
      }),
    ]);

    if (sendConfirmationSMS) {
      await sendSMS(
        restStaffData.phone,
        renderText(ApplicationMessages.staff.APPROVAL, {
          applicant_name: restStaffData.name,
        }),
      );
    }

    if (originSource === "public_form" && applicationId) {
      await sendSMS(
        restStaffData.phone,
        renderText(ApplicationMessages.staff.SUBMISSION, {
          applicant_name: restStaffData.name,
          tracking_link: generateUrl("application-tracking", {
            trackingId: applicationId,
          }),
        }),
      );
    }

    revalidatePath("/staffs", "layout");
    revalidatePath("/applications", "layout");

    return {
      success: true,
      message: "Added successfully",
      data: { name: restStaffData.name },
    };
  } catch (error) {
    console.error("Create staff error:", error);
    return { success: false, message: "Something went wrong" };
  }
};

export const updateStaff = async (staffId: string, formData: FormData) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const formDataObject = Object.fromEntries(formData);
    const validatedStaffData = UpdateStaffDataSchema.parse(formDataObject);

    const { photo, nidFrontPhoto, nidBackPhoto, bankInfo, ...restStaffData } =
      validatedStaffData;

    // Build update payload and generate new media keys when new files are uploaded
    const updatePayload: Partial<typeof staffs.$inferInsert> = {
      ...restStaffData,
      bankInfo: bankInfo || null,
      walletNumber: restStaffData.walletNumber || null,
      docs: restStaffData.docs ? JSON.stringify(restStaffData.docs) : undefined,
      role: restStaffData.hasInstallationExperience
        ? "electrician"
        : "technician",
    };

    if (photo instanceof File && photo.size > 0) {
      updatePayload.photoKey = `media/staff/${staffId}/profile_${uuidv4()}.webp`;
    }
    if (nidFrontPhoto instanceof File && nidFrontPhoto.size > 0) {
      updatePayload.nidFrontPhotoKey = `media/staff/${staffId}/nid-front_${uuidv4()}.webp`;
    }
    if (nidBackPhoto instanceof File && nidBackPhoto.size > 0) {
      updatePayload.nidBackPhotoKey = `media/staff/${staffId}/nid-back_${uuidv4()}.webp`;
    }

    await db
      .update(staffs)
      .set(updatePayload)
      .where(eq(staffs.staffId, staffId));

    // Handle file uploads if present
    const uploadPromises: Promise<any>[] = [];

    if (photo instanceof File && photo.size > 0) {
      uploadPromises.push(
        (async () => {
          const photoBuffer = Buffer.from(await photo.arrayBuffer());
          const compressed = await compressImage(photoBuffer, "portrait");
          await putObject({
            Key: updatePayload.photoKey!,
            Body: compressed,
            ContentType: "image/webp",
          });
        })(),
      );
    }

    if (nidFrontPhoto instanceof File && nidFrontPhoto.size > 0) {
      uploadPromises.push(
        (async () => {
          const nidFrontBuffer = Buffer.from(await nidFrontPhoto.arrayBuffer());
          const compressed = await compressImage(nidFrontBuffer, "nid");
          await putObject({
            Key: updatePayload.nidFrontPhotoKey!,
            Body: compressed,
            ContentType: "image/webp",
          });
        })(),
      );
    }

    if (nidBackPhoto instanceof File && nidBackPhoto.size > 0) {
      uploadPromises.push(
        (async () => {
          const nidBackBuffer = Buffer.from(await nidBackPhoto.arrayBuffer());
          const compressed = await compressImage(nidBackBuffer, "nid");
          await putObject({
            Key: updatePayload.nidBackPhotoKey!,
            Body: compressed,
            ContentType: "image/webp",
          });
        })(),
      );
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    revalidatePath("/staffs", "layout");
    return { success: true, message: "Updated successfully" };
  } catch (error) {
    console.error("Update staff error:", error);
    return { success: false, message: "Something went wrong" };
  }
};

export const toggleStaffStatus = async (staffId: string, status: boolean) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    const staff = await db.query.staffs.findFirst({
      where: eq(staffs.staffId, staffId),
    });

    if (!staff) return { success: false, message: "Staff not found" };

    await db
      .update(staffs)
      .set({ isActiveStaff: status })
      .where(eq(staffs.staffId, staffId));

    const { notifyStaff } = await import("./notificationActions");
    if (!status) {
      // Sending block notification SMS
      const blockMessage = `প্রিয় ${staff.name},\nআপনার অ্যাকাউন্টটি সাময়িকভাবে বন্ধ (Blocked) করা হয়েছে। বিস্তারিত জানতে বা অ্যাকাউন্টটি সক্রিয় করতে এডমিনের সাথে যোগাযোগ করুন। ${contactDetails.customerCare}`;
      await notifyStaff({
        staffId,
        phoneNumber: staff.phone,
        type: "account_status",
        message: blockMessage,
        shortMessage: `আপনার অ্যাকাউন্টটি সাময়িকভাবে বন্ধ করা হয়েছে। বিস্তারিত জানতে এডমিনের সাথে যোগাযোগ করুন।`,
        link: "/staff/profile",
      });
    } else {
      const activeMessage = `প্রিয় ${staff.name},\nআপনার অ্যাকাউন্টটি পুনরায় সক্রিয় (Activated) করা হয়েছে। আপনি এখন লগইন করে কাজ করতে পারবেন। ${contactDetails.customerCare}`;
      await notifyStaff({
        staffId,
        phoneNumber: staff.phone,
        type: "account_status",
        message: activeMessage,
        shortMessage: `আপনার অ্যাকাউন্টটি পুনরায় সক্রিয় করা হয়েছে। আপনি এখন কাজ করতে পারবেন।`,
        link: "/staff/profile",
      });
    }

    revalidatePath("/staffs");
    return {
      success: true,
      message: status ? "Staff activated" : "Staff blocked",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const deleteStaff = async (staffId: string) => {
  try {
    const session = await verifySession(false, "admin");
    if (!session) return { success: false, message: "Unauthorized" };

    await db.transaction(async (tx) => {
      const serviceData = await tx
        .delete(staffs)
        .where(eq(staffs.staffId, staffId))
        .returning({
          photoKey: staffs.photoKey,
          nidFrontPhotoKey: staffs.nidFrontPhotoKey,
          nidBackPhotoKey: staffs.nidBackPhotoKey,
        });
      await tx
        .delete(applications)
        .where(eq(applications.applicantId, staffId));
      await tx.delete(userAgreements).where(eq(userAgreements.userId, staffId));
      await Promise.all([
        deleteObject({ Key: serviceData[0].photoKey }),
        deleteObject({ Key: serviceData[0].nidFrontPhotoKey }),
        deleteObject({ Key: serviceData[0].nidBackPhotoKey }),
      ]);
    });
    revalidatePath("/staffs");
    revalidatePath("/applications");
    return { success: true, message: "Service deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

// ============================================
// STAFF AUTHENTICATION
// ============================================

export async function staffLogin(prevState: any, credentials: FormData) {
  try {
    const { username, password } = LoginCredentialsSchema.parse(
      Object.fromEntries(credentials),
    );

    const staff = await db.query.staffs.findFirst({
      where: eq(staffs.username, username),
    });

    if (!staff) {
      return { success: false, message: "Invalid username or password" };
    }

    if (!staff.isActiveStaff) {
      return {
        success: false,
        isBlocked: true,
        message: "আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। অনুগ্রহ করে এডমিনের সাথে যোগাযোগ করুন।",
      };
    }

    if (!staff.password) {
      return { success: false, message: "Invalid username or password" };
    }

    const matched = await bcrypt.compare(password, staff.password);

    if (!matched) {
      return { success: false, message: "Invalid username or password" };
    }

    await createSession({
      username: staff.username || "",
      userId: staff.staffId,
      role: "staff",
    });
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

  redirect("/staff/profile", RedirectType.replace);
}

export async function staffLogout() {
  await deleteSession();
  redirect("/staff/login", RedirectType.replace);
}

export async function verifyStaffSession() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session.role !== "staff") {
    return { isAuth: false };
  }

  try {
    const staff = await db.query.staffs.findFirst({
      where: eq(staffs.staffId, session.userId as string),
      columns: {
        id: true,
        staffId: true,
        name: true,
        username: true,
        role: true,
        isActiveStaff: true,
      },
    });

    if (!staff || !staff.isActiveStaff) {
      return { isAuth: false };
    }

    return {
      isAuth: true,
      userId: session.userId,
      username: session.username,
      role: "staff",
      staff,
    };
  } catch (error) {
    console.error("verifyStaffSession database error:", error);
    return { isAuth: false };
  }
}

// ============================================
// STAFF PROFILE MANAGEMENT
// ============================================

export async function updateMyProfileForm(
  _prevState: { success: boolean; message: string } | undefined,
  formData: FormData,
) {
  const session = await verifyStaffSession();
  if (!session.isAuth || typeof session.userId !== "string") {
    return { success: false, message: "Not authenticated" };
  }
  return updateMyProfile(session.userId, formData);
}

export async function updateMyProfile(staffId: string, data: FormData) {
  try {
    const formDataObject = Object.fromEntries(data);
    const { photo, skills, bio, ...profileData } = formDataObject;

    const staffData: any = {};

    // Only allow specific fields to be updated by staff themselves
    if (profileData.phone) staffData.phone = profileData.phone;
    if (profileData.currentStreetAddress)
      staffData.currentStreetAddress = profileData.currentStreetAddress;
    if (profileData.currentDistrict)
      staffData.currentDistrict = profileData.currentDistrict;
    if (profileData.currentPoliceStation)
      staffData.currentPoliceStation = profileData.currentPoliceStation;
    if (profileData.currentPostOffice)
      staffData.currentPostOffice = profileData.currentPostOffice;
    if (skills && skills.toString().trim()) {
      const skillsArray = skills
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      staffData.skills = JSON.stringify(skillsArray);
    }
    if (bio) staffData.bio = bio;

    if (profileData.paymentPreference) {
      staffData.paymentPreference = profileData.paymentPreference as
        | "cash"
        | "bkash"
        | "nagad"
        | "rocket"
        | "bank";
    }

    const pref =
      staffData.paymentPreference ?? (profileData.paymentPreference as string);
    if (pref === "bank") {
      if (
        profileData.bankName &&
        profileData.accountHolderName &&
        profileData.accountNumber &&
        profileData.branchName
      ) {
        staffData.bankInfo = {
          bankName: String(profileData.bankName),
          accountHolderName: String(profileData.accountHolderName),
          accountNumber: String(profileData.accountNumber),
          branchName: String(profileData.branchName),
        };
        staffData.walletNumber = null;
      }
    } else if (["bkash", "nagad", "rocket"].includes(pref || "")) {
      if (profileData.walletNumber) {
        staffData.walletNumber =
          String(profileData.walletNumber).trim() || null;
        staffData.bankInfo = null;
      }
    }

    let photoKey;
    if (photo && photo instanceof File && photo.size > 0) {
      photoKey = `media/staff/${staffId}/profile_${uuidv4()}.webp`;
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const compressed = await compressImage(photoBuffer, "portrait");
      await putObject({
        Key: photoKey,
        Body: compressed,
        ContentType: "image/webp",
      });
      staffData.photoKey = photoKey;
    }

    await db.update(staffs).set(staffData).where(eq(staffs.staffId, staffId));

    revalidatePath("/staff/profile");
    revalidatePath("/staff/details");
    revalidatePath("/staff/payment/settings");
    revalidatePath("/staff/payment/request");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function setStaffCredentials(
  staffId: string,
  username: string,
  password: string,
) {
  try {
    if (!username || !password) {
      return { success: false, message: "Username and password required" };
    }

    const existing = await db.query.staffs.findFirst({
      where: eq(staffs.username, username),
    });

    if (existing && existing.staffId !== staffId) {
      return { success: false, message: "Username already taken" };
    }

    const staffData = await db.query.staffs.findFirst({
      where: eq(staffs.staffId, staffId),
      columns: { name: true, phone: true },
    });

    if (!staffData) {
      return { success: false, message: "Staff not found" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(staffs)
      .set({ username, password: hashedPassword, profileCompleted: true })
      .where(eq(staffs.staffId, staffId));

    // Send SMS with credentials
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/staff/login`;
    const message = ApplicationMessages.staff.CREDENTIALS.replace(
      "{staff_name}",
      staffData.name
    )
      .replace("{username}", username)
      .replace("{password}", password)
      .replace("{login_url}", loginUrl);

    await sendSMS(staffData.phone, message);

    revalidatePath("/staffs");
    return { success: true, message: "Login credentials set and SMS sent" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to set credentials" };
  }
}

export async function getStaffProfileStats(staffId: string) {
  try {
    const [
      totalServices,
      successfulServices,
      canceledServices,
      ratingResult,
      staffPayments,
      addedResult,
      requestedResult,
    ] = await Promise.all([
      db.$count(services, eq(services.staffId, staffId)),
      db.$count(
        services,
        and(eq(services.staffId, staffId), eq(services.resolvedBy, "staff_member")),
      ),
      db.$count(
        services,
        and(eq(services.staffId, staffId), eq(services.resolvedBy, "service_center")),
      ),
      db
        .select({ avg: sql<number>`AVG(${feedbacks.rating})` })
        .from(feedbacks)
        .innerJoin(services, eq(services.serviceId, feedbacks.serviceId))
        .where(eq(services.staffId, staffId))
        .limit(1),
      db.query.payments.findMany({
        where: eq(payments.staffId, staffId),
        orderBy: (payments, { desc }) => [desc(payments.date)],
        limit: 10,
      }),
      db
        .select({ sum: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(and(eq(payments.staffId, staffId), sql`${payments.status} = 'credited'`))
        .limit(1),
      db
        .select({ sum: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(
          and(
            eq(payments.staffId, staffId),
            sql`${payments.status} IN ('requested', 'pending', 'approved', 'completed')`,
          ),
        )
        .limit(1),
    ]);

    const rating = ratingResult[0]?.avg || 0;
    const totalAdded = addedResult[0]?.sum || 0;
    const totalRequested = requestedResult[0]?.sum || 0;
    const availableBalance = totalAdded - totalRequested;

    return {
      success: true,
      data: {
        totalServices,
        successfulServices,
        canceledServices,
        rating: parseFloat(rating.toFixed(2)),
        payments: staffPayments,
        availableBalance,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to fetch stats" };
  }
}

export async function updateStaffStats(staffId: string) {
  try {
    await db.transaction(async (tx) => {
      // Recalculate all stats for the staff
      const totalCount = await tx.$count(
        services,
        eq(services.staffId, staffId),
      );
      const successCount = await tx.$count(
        services,
        and(
          eq(services.staffId, staffId),
          eq(services.resolvedBy, "staff_member"),
        ),
      );
      const canceledCount = await tx.$count(
        services,
        and(
          eq(services.staffId, staffId),
          eq(services.resolvedBy, "service_center"),
        ),
      );

      const ratingResult = await tx
        .select({ avg: sql<number>`AVG(${feedbacks.rating})` })
        .from(feedbacks)
        .innerJoin(services, eq(services.serviceId, feedbacks.serviceId))
        .where(eq(services.staffId, staffId))
        .limit(1);

      const rating = ratingResult[0]?.avg || 0;

      await tx
        .update(staffs)
        .set({
          totalServices: totalCount,
          successfulServices: successCount,
          canceledServices: canceledCount,
          rating: parseFloat(rating.toFixed(2)),
        })
        .where(eq(staffs.staffId, staffId));
    });

    return { success: true, message: "Stats updated" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update stats" };
  }
}

// Call updateStaffStats when:
// - service is completed (in serviceActions.updateService)
// - service is canceled
// - feedback is submitted (in feedbackActions)

export async function getMyServices(staffId: string) {
  try {
    const servicesData = await db.query.services.findMany({
      where: eq(services.staffId, staffId),
      with: {
        statusHistory: {
          columns: {
            updatedAt: false,
            serviceId: false,
          },
          limit: 1,
          orderBy: (statusHistory, { desc }) => [desc(statusHistory.createdAt)],
        },
      },
      orderBy: (services, { desc }) => [desc(services.createdAt)],
      limit: 50,
    });

    return { success: true, data: servicesData };
  } catch (error) {
    return { success: false, message: "Failed to fetch services" };
  }
}

export const getStaffNotifications = async () => {
  try {
    const session = await verifySession(false, "staff");
    if (!session) return { success: false, message: "Unauthorized" };

    const { staffNotifications } = await import("@/db/schema");
    const { desc } = await import("drizzle-orm");

    const notifications = await db
      .select()
      .from(staffNotifications)
      .where(eq(staffNotifications.staffId, session.userId as string))
      .orderBy(desc(staffNotifications.createdAt))
      .limit(10);


    return { success: true, data: notifications };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Could not fetch notifications" };
  }
};

export const markStaffNotificationAsRead = async (id: string) => {
  try {
    const session = await verifySession(false, "staff");
    if (!session) return { success: false, message: "Unauthorized" };

    const { staffNotifications } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(staffNotifications)
      .set({ isRead: true })
      .where(eq(staffNotifications.id, id));

    return { success: true, message: "Notification marked as read" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};
