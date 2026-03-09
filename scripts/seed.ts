import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../src/db/schema";

if (typeof (process as any).loadEnvFile === "function") {
  (process as any).loadEnvFile();
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const db = drizzle(DATABASE_URL, { schema });

async function seed() {
  console.log("🌱 Starting seeding database...");

  try {
    // 1. Clear existing data
    console.log("Cleaning up existing data...");
    await db.delete(schema.payments);
    await db.delete(schema.feedbacks);
    await db.delete(schema.serviceStatusHistory);
    await db.delete(schema.services);
    await db.delete(schema.products);
    await db.delete(schema.invoices);
    await db.delete(schema.customers);
    await db.delete(schema.userAgreements);
    await db.delete(schema.staffs);
    await db.delete(schema.admins);
    await db.delete(schema.subscriptions);
    await db.delete(schema.applications);
    await db.delete(schema.agreements);

    // 2. Create Admin
    console.log("Creating admin...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db.insert(schema.admins).values({
      username: "admin",
      password: adminPassword,
    });

    // 3. Create Agreements
    console.log("Creating agreements...");
    const [agreement] = await db
      .insert(schema.agreements)
      .values({
        type: "application_declaration",
        title: "Standard Service Agreement",
        content: "I agree to the terms and conditions of SE Electronics.",
        version: "1.0",
      })
      .returning();

    // 4. Create Staff members
    console.log("Creating staff members...");
    const staffData = [];
    for (let i = 0; i < 3; i++) {
      const staffId = `STF${faker.string.numeric(5)}`;
      const password = await bcrypt.hash("staff123", 10);
      staffData.push({
        staffId,
        username: staffId.toLowerCase(),
        password,
        name: faker.person.fullName(),
        fatherName: faker.person.fullName(),
        phone: `+8801${faker.string.numeric(9)}`,
        currentStreetAddress: faker.location.streetAddress(),
        currentDistrict: "Dhaka",
        permanentStreetAddress: faker.location.streetAddress(),
        permanentDistrict: "Dhaka",
        photoKey: "demo/photo.jpg",
        nidFrontPhotoKey: "demo/nid_front.jpg",
        nidBackPhotoKey: "demo/nid_back.jpg",
        role: i % 2 === 0 ? ("technician" as const) : ("electrician" as const),
        isVerified: true,
        isActiveStaff: true,
        profileCompleted: true,
        paymentPreference: "cash" as const,
        createdFrom: "dashboard" as const,
      });
    }
    const createdStaffs = await db
      .insert(schema.staffs)
      .values(staffData)
      .returning();

    // 5. Create Customers & Invoices
    console.log("Creating customers, invoices and products...");
    for (let i = 0; i < 5; i++) {
      const customerId = `CST${faker.string.numeric(5)}`;
      const invoiceNumber = `INV${faker.string.numeric(6)}`;

      const [customer] = await db
        .insert(schema.customers)
        .values({
          customerId,
          name: faker.person.fullName(),
          phone: `+8801${faker.string.numeric(9)}`,
          address: faker.location.streetAddress(),
          invoiceNumber,
          isActiveCustomer: true,
          profileCompleted: true,
        })
        .returning();

      const [invoice] = await db
        .insert(schema.invoices)
        .values({
          invoiceNumber,
          customerId: customer.customerId,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          paymentType: "bkash",
          subtotal: 5000,
          total: 5500,
          dueAmount: 0,
        })
        .returning();

      await db.insert(schema.products).values([
        {
          invoiceId: invoice.id,
          type: "ips",
          model: "IPS-MAX-500",
          quantity: 1,
          unitPrice: 3000,
          warrantyStartDate: new Date(),
          warrantyDurationMonths: 24,
        },
        {
          invoiceId: invoice.id,
          type: "battery",
          model: "BAT-SUPER-150",
          quantity: 1,
          unitPrice: 2000,
          warrantyStartDate: new Date(),
          warrantyDurationMonths: 12,
        },
      ]);

      // 6. Create Services for some customers
      if (i < 3) {
        const serviceId = `SRV${faker.string.numeric(6)}`;
        const [service] = await db
          .insert(schema.services)
          .values({
            serviceId,
            customerId: customer.customerId,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            type: "repair",
            productType: "ips",
            productModel: "IPS-MAX-500",
            reportedIssue: "Device not turning on.",
            createdFrom: "dashboard",
            isActive: true,
            staffId: i === 0 ? createdStaffs[0].staffId : null,
            staffName: i === 0 ? createdStaffs[0].name : null,
            staffPhone: i === 0 ? createdStaffs[0].phone : null,
          })
          .returning();

        await db.insert(schema.serviceStatusHistory).values({
          serviceId: service.serviceId,
          status: "pending",
          statusType: "system",
        });

        if (i === 0) {
          await db.insert(schema.serviceStatusHistory).values({
            serviceId: service.serviceId,
            status: "in_progress",
            statusType: "system",
          });
        }
      }
    }

    // 7. Create Subscriptions
    console.log("Creating subscriptions...");
    await db.insert(schema.subscriptions).values([
      {
        subscriptionId: `SUB${faker.string.numeric(5)}`,
        name: faker.person.fullName(),
        phone: `+88017${faker.string.numeric(8)}`,
        streetAddress: faker.location.streetAddress(),
        district: "Dhaka",
        subscriptionDuration: 12,
        subscriptionType: "ips_and_battery_maintenance",
        batteryType: "Tall Tubular",
        ipsBrand: "Luminous",
        ipsPowerRating: "800VA",
        paymentType: "cash",
        basePrice: 1200,
        totalFee: 1200,
        isActive: true,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      },
    ]);

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
