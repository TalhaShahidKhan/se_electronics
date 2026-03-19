"use server";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppError } from "@/utils";
import path from "path";
import fs from "fs";

type PayoutPreference = "bkash" | "nagad" | "rocket" | "bank";

const productMap: Record<string, string> = {
  ips: "আইপিএস (IPS)",
  battery: "ব্যাটারি (Battery)",
  stabilizer: "ভোল্টেজ স্ট্যাবিলাইজার",
  others: "অন্যান্য",
};

async function convertToBase64(filePath: string): Promise<string> {
  const fileBuffer = await fs.promises.readFile(filePath);
  const extensionName = path.extname(filePath).toLowerCase();
  let mimeType = "image/jpeg";
  if (extensionName === ".png") mimeType = "image/png";
  else if (extensionName === ".svg") mimeType = "image/svg+xml";

  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

export async function generatePDF(type: string, id: string) {
  try {
    let html = "";
    let options: any = {
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    };

    switch (type) {
      case "invoice-due":
      case "invoice-paid": {
        const InvoiceTemplate = (
          await import("@/components/features/invoices/InvoiceTemplate")
        ).default;
        const { getInvoiceWithDetails } = (await import(
          "@/actions/invoiceActions"
        )) as any;
        const invoice = await getInvoiceWithDetails(id);
        if (!invoice) throw new AppError("ইনভয়েসটি পাওয়া যায়নি।");

        const templatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          type === "invoice-due"
            ? "customer-invoice-due.jpg"
            : "customer-invoice-paid.jpg",
        );
        const backgroundBase64 = await convertToBase64(templatePath);

        const data = {
          invoiceId: invoice.invoiceId,
          date: invoice.createdAt,
          customer: {
            name: invoice.customer?.name || "",
            address: invoice.customer?.address || "",
            phone: invoice.customer?.phone || "",
          },
          items: invoice.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          total: invoice.total,
          status: invoice.status,
          backgroundImage: backgroundBase64,
        };

        html = renderToStaticMarkup(<InvoiceTemplate data={data as any} />);
        break;
      }

      case "payment-receipt": {
        const PaymentReceiptTemplate = (
          await import("@/components/features/payments/PaymentReceiptTemplate")
        ).default;
        const { getPaymentById } = (await import("@/actions/paymentActions")) as any;
        const payment = await getPaymentById(id);
        if (!payment) throw new AppError("পেমেন্টটি পাওয়া যায়নি।");

        const templatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          "payment-receipt.jpg",
        );
        const backgroundBase64 = await convertToBase64(templatePath);

        const data = {
          receiptId: payment.paymentId,
          date: payment.createdAt,
          staff: {
            name: payment.staff?.name || "",
            role: payment.staff?.role || "",
          },
          amount: payment.amount,
          method: payment.method,
          transactionId: payment.transactionId,
          status: payment.status,
          backgroundImage: backgroundBase64,
        };

        html = renderToStaticMarkup(
          <PaymentReceiptTemplate data={data as any} />,
        );
        break;
      }

      case "id-card": {
        const IdCardTemplate = (
          await import("@/components/features/staff/IdCardTemplate")
        ).default;
        const { getStaffById } = (await import("@/actions/staffActions")) as any;
        const response = await getStaffById(id);
        if (!response.success || !response.data) throw new AppError("স্টাফকে পাওয়া যায়নি।");
        const staff = response.data;

        const frontTemplatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          staff.role === "technician" ? "technician-card.jpg" : "electrician-card.jpg",
        );
        const backTemplatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          "id-card-back.jpg",
        );
        
        const frontBase64 = await convertToBase64(frontTemplatePath);
        const backBase64 = await convertToBase64(backTemplatePath);
        
        // Profile picture base64
        let profilePicBase64 = "";
        if (staff.photoUrl) {
           profilePicBase64 = staff.photoUrl;
        }

        const data = {
          ...staff,
          role: staff.role === "technician" ? "Technician" : "Electrician",
          backgroundFront: frontBase64,
          backgroundBack: backBase64,
          issueDate: new Date(),
        };

        html = renderToStaticMarkup(<IdCardTemplate data={data as any} />);
        options = {
          width: "85.6mm",
          height: "54mm",
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        };
        break;
      }

      case "certificate": {
        const CertificateTemplate = (
          await import("@/components/features/staff/CertificateTemplate")
        ).default;
        const { getStaffById } = (await import("@/actions/staffActions")) as any;
        const response = await getStaffById(id);
        if (!response.success || !response.data) throw new AppError("স্টাফকে পাওয়া যায়নি।");
        const staff = response.data;

        const templatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          "certificate-template.jpg",
        );
        const backgroundBase64 = await convertToBase64(templatePath);

        const data = {
          ...staff,
          role: staff.role === "technician" ? "Technician" : "Electrician",
          bgImage: backgroundBase64,
          issueDate: new Date(),
        };

        html = renderToStaticMarkup(<CertificateTemplate data={data as any} />);
        options = {
          format: "A4",
          landscape: true,
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        };
        break;
      }

      case "complaint": {
        const ComplaintTemplate = (
          await import("@/components/features/complaints/ComplaintTemplate")
        ).default;
        const { getComplaintById } = await import("@/actions/complaintActions");
        const response = await getComplaintById(id);
        if (!response.success || !response.data)
          throw new AppError("অভিযোগটি পাওয়া যায়নি।");
        const c = response.data!;

        const logoBase64 = await convertToBase64(
          path.join(process.cwd(), "public", "logo.jpg"),
        ).catch(() => undefined);

        const data = {
          complaintId: c.complaintId,
          customer: {
            name: c.customer?.name || "",
            customerId: c.customer?.customerId || "",
            phone: c.customer?.phone || "",
            address: c.customer?.address || "",
          },
          staff: {
            name: c.staff?.name || "",
            phone: c.staff?.phone || "",
            role: c.staff?.role || "",
            staffId: c.staffId,
            currentStreetAddress: c.staff?.currentStreetAddress,
            currentDistrict: c.staff?.currentDistrict,
          },
          productType: productMap[c.service?.productType || ""] || "ইলেকট্রনিক্স",
          subject: c.subject,
          description: c.description,
          status: c.status,
          adminNote: c.adminNote,
          createdAt: c.createdAt,
          logo: logoBase64,
        };

        html = renderToStaticMarkup(<ComplaintTemplate data={data as any} />);
        break;
      }

      case "hearing-notice": {
        const HearingNoticeTemplate = (
          await import("@/components/features/complaints/HearingNoticeTemplate")
        ).default;
        const { getComplaintById } = await import("@/actions/complaintActions");
        const response = await getComplaintById(id);
        if (!response.success || !response.data)
          throw new AppError("অভিযোগটি পাওয়া যায়নি।");
        const c = response.data!;

        const logoBase64 = await convertToBase64(
          path.join(process.cwd(), "public", "logo.jpg"),
        ).catch(() => undefined);

        const issueDateBn = new Date().toLocaleDateString("bn-BD");
        const receiptNum = c.complaintId.replace(/\D/g, "").slice(0, 5) || "14285";

        const data = {
          complaintId: c.complaintId,
          customer: {
            name: c.customer?.name || "",
            customerId: c.customer?.customerId || "",
            phone: c.customer?.phone || "",
            address: c.customer?.address || "",
          },
          staff: {
            name: c.staff?.name || "",
            phone: c.staff?.phone || "",
            role: c.staff?.role || "",
            staffId: c.staffId,
          },
          subject: c.subject,
          adminNote: c.adminNote,
          issueDateBn,
          receiptNum,
          logo: logoBase64,
        };

        html = renderToStaticMarkup(<HearingNoticeTemplate data={data as any} />);
        break;
      }

      case "completion-notice": {
        const CompletionNoticeTemplate = (
          await import("@/components/features/complaints/CompletionNoticeTemplate")
        ).default;
        const { getComplaintById } = await import("@/actions/complaintActions");
        const response = await getComplaintById(id);
        if (!response.success || !response.data)
          throw new AppError("অভিযোগটি পাওয়া যায়নি।");
        const c = response.data!;

        const logoBase64 = await convertToBase64(
          path.join(process.cwd(), "public", "logo.jpg"),
        ).catch(() => undefined);

        const resolvedDateBn = new Date().toLocaleDateString("bn-BD");
        const receiptNo = c.complaintId.replace(/\D/g, "").slice(0, 5) || "14285";

        const data = {
          complaintId: c.complaintId,
          customer: {
            name: c.customer?.name || "",
            customerId: c.customer?.customerId || "",
            phone: c.customer?.phone || "",
            address: c.customer?.address || "",
          },
          staff: {
            name: c.staff?.name || "",
            phone: c.staff?.phone || "",
            role: c.staff?.role || "",
            staffId: c.staffId,
          },
          subject: c.subject,
          adminNote: c.adminNote,
          resolvedDateBn,
          receiptNo,
          logo: logoBase64,
        };

        html = renderToStaticMarkup(<CompletionNoticeTemplate data={data as any} />);
        break;
      }

      case "staff-payment": {
           const StaffPaymentTemplate = (await import("@/components/features/payments/PaymentReceiptTemplate")).default;
           const { getPaymentById } = (await import("@/actions/paymentActions")) as any;
           const payment = await getPaymentById(id);
           if (!payment || !payment.staff) throw new AppError("পেমেন্ট খুঁজে পাওয়া যায়নি।");
           const data = {
                receiptId: payment.paymentId, date: payment.createdAt, staff: { name: payment.staff.name, role: payment.staff.role },
                amount: payment.amount, method: payment.method as PayoutPreference, walletNumber: payment.receiverWalletNumber,
                bankInfo: payment.receiverBankInfo, transactionId: payment.transactionId, status: payment.status
           };
           html = renderToStaticMarkup(<StaffPaymentTemplate data={data as any} />);
           break;
      }

      default:
        throw new AppError("অকার্যকর ড্রকুমেন্ট টাইপ।");
    }

    const puppeteer = (await import("puppeteer-core")).default;
    const chromium = (await import("@sparticuz/chromium")).default;

    let browser;
    if (process.env.NODE_ENV === "production") {
      browser = await puppeteer.launch({
        args: (chromium as any).args,
        defaultViewport: (chromium as any).defaultViewport,
        executablePath: await (chromium as any).executablePath(),
        headless: (chromium as any).headless,
      });
    } else {
      const chromePaths = [
        path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      ];
      let executablePath = null;
      for (const p of chromePaths) {
        if (fs.existsSync(p)) {
          executablePath = p;
          break;
        }
      }
      if (!executablePath) throw new AppError("Chrome browser was not found.");
      browser = await puppeteer.launch({ executablePath, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    }

    const page = await browser.newPage();
    const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.maateen.me/solaiman-lipi/font.css" rel="stylesheet">
                <style>
                    @page { margin: 0; }
                    body { margin: 0; padding: 0; font-family: 'SolaimanLipi', sans-serif; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                </style>
            </head>
            <body class="bg-gray-100">
                ${html}
            </body>
            </html>
        `;

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    const pdf = await page.pdf(options);
    await browser.close();
    return { success: true, data: Buffer.from(pdf).toString("base64") };
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return { success: false, error: error.message || "পিডিএফ তৈরি করতে সমস্যা হয়েছে।" };
  }
}
