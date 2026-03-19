"use server";

import React from "react";
import { AppError } from "@/utils";
import path from "path";
import fs from "fs";
import { 
  CertificateTemplateData, 
  CompletionNoticeTemplateData, 
  ComplaintTemplateData, 
  HearingNoticeTemplateData, 
  IdCardTemplateData, 
  InvoiceTemplateData, 
  PaymentReceiptTemplateData 
} from "./pdfTypes";
import { DocType } from "@/types";

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
  else if (extensionName === ".ttf") mimeType = "font/ttf";

  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

export default async function generatePDF({ 
  docType, 
  id, 
  token 
}: { 
  docType: DocType; 
  id: string; 
  token?: string; 
}) {
  try {
    // Dynamic import of react-dom/server to fix Vercel build issues in Server Actions
    const { renderToStaticMarkup } = await import("react-dom/server");

    let finalDocType = docType;
    let finalId = id;
    let payload: any = null;

    if (token) {
      const { verifyAuthToken } = await import("@/actions/authActions");
      const tokenResult = await verifyAuthToken(token);
      if (!tokenResult.isValid) {
        throw new AppError("ডাউনলোড লিংকটির মেয়াদ শেষ বা অকার্যকর।");
      }
      payload = tokenResult.payload;
      if (payload) {
        finalDocType = payload.type || docType;
        finalId = payload.id || id || payload.staffId;
      }
    }

    let html = "";
    let options: any = {
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    };

    switch (finalDocType) {
      case "invoice": {
        const InvoiceTemplate = (
          await import("@/components/features/invoices/InvoiceTemplate")
        ).default;
        const { getInvoiceByNumber } = await import("@/actions/invoiceActions");
        const response = await getInvoiceByNumber(finalId);
        
        if (!response.success || !response.data) {
          throw new AppError("ইনভয়েসটি পাওয়া যায়নি।");
        }
        const invoice = response.data;

        const isDue = invoice.dueAmount > 0;
        const templatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          isDue ? "customer-invoice-due.jpg" : "customer-invoice-paid.jpg",
        );
        const backgroundBase64 = await convertToBase64(templatePath);

        const data: InvoiceTemplateData = {
          ...invoice,
          bgImage: backgroundBase64,
        };

        html = renderToStaticMarkup(<InvoiceTemplate data={data} />);
        break;
      }

      case "payment": {
        const PaymentReceiptTemplate = (
          await import("@/components/features/payments/PaymentReceiptTemplate")
        ).default;
        const { getPaymentById } = await import("@/actions/paymentActions");
        const payment = await getPaymentById(finalId);
        if (!payment) throw new AppError("পেমেন্টটি পাওয়া যায়নি।");

        const templatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          "payment-receipt.jpg",
        );
        const backgroundBase64 = await convertToBase64(templatePath);

        const data: PaymentReceiptTemplateData = {
          bgImage: backgroundBase64,
          invoiceNumber: payment.invoiceNumber,
          date: payment.date,
          description: payment.description,
          staffId: payment.staffId,
          transactionId: payment.transactionId,
          paymentId: payment.paymentId,
          paymentMethod: payment.paymentMethod,
          senderWalletNumber: payment.senderWalletNumber,
          senderBankInfo: payment.senderBankInfo,
          receiverWalletNumber: payment.receiverWalletNumber,
          receiverBankInfo: payment.receiverBankInfo,
          amount: payment.amount,
          staff: {
            name: payment.staff?.name || "",
          },
          serviceId: payment.serviceId,
        };

        html = renderToStaticMarkup(<PaymentReceiptTemplate data={data} />);
        break;
      }

      case "id-card": {
        const IdCardTemplate = (
          await import("@/components/features/staff/IdCardTemplate")
        ).default;
        const { getStaffById } = await import("@/actions/staffActions");
        const response = await getStaffById(finalId);
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
        
        const { qrcode, barcode } = await import("@/lib/id-gen");
        const qrCodeData = await qrcode(staff.staffId);
        const barcodeData = await barcode(staff.staffId);

        const data: IdCardTemplateData = {
          ...staff,
          currentPoliceStation: staff.currentPoliceStation || "",
          currentPostOffice: staff.currentPostOffice || "",
          photoUrl: staff.photoUrl || "",
          frontBgImage: frontBase64,
          backBgImage: backBase64,
          issueDate: new Date(),
          qrcode: qrCodeData,
          barcode: barcodeData,
        };

        html = renderToStaticMarkup(<IdCardTemplate data={data} />);
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
        
        let staffInfo: any = payload; // Certificate data is often passed via payload in token
        
        if (!staffInfo || finalDocType !== "certificate" || !staffInfo.shopName) {
           const { getStaffById } = await import("@/actions/staffActions");
           const response = await getStaffById(finalId);
           if (!response.success || !response.data) throw new AppError("স্টাফকে পাওয়া যায়নি।");
           staffInfo = response.data;
        }

        const templatePath = path.join(
          process.cwd(),
          "src",
          "assets",
          "images",
          "certificate-template.jpg",
        );
        const backgroundBase64 = await convertToBase64(templatePath);

        const fontsPath = path.join(process.cwd(), "src", "assets", "fonts");
        const font1 = await convertToBase64(path.join(fontsPath, "oldenglishtextmt.ttf"));
        const font2 = await convertToBase64(path.join(fontsPath, "edwardianscriptitc.ttf"));
        const font3 = await convertToBase64(path.join(fontsPath, "brockScript.ttf"));

        const { qrcode } = await import("@/lib/id-gen");
        const qrCodeData = await qrcode(staffInfo.staffId || staffInfo.shopId);

        const data: any = {
          ...staffInfo,
          bgImage: backgroundBase64,
          issueDate: new Date(),
          qrcode: qrCodeData,
          font1, 
          font2, 
          font3
        };

        html = renderToStaticMarkup(<CertificateTemplate data={data} />);
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
        const response = await getComplaintById(finalId);
        if (!response.success || !response.data)
          throw new AppError("অভিযোগটি পাওয়া যায়নি।");
        const c = response.data!;

        const logoBase64 = await convertToBase64(
          path.join(process.cwd(), "public", "logo.jpg"),
        ).catch(() => undefined);

        const data: ComplaintTemplateData = {
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

        html = renderToStaticMarkup(<ComplaintTemplate data={data} />);
        break;
      }

      case "hearing-notice": {
        const HearingNoticeTemplate = (
          await import("@/components/features/complaints/HearingNoticeTemplate")
        ).default;
        const { getComplaintById } = await import("@/actions/complaintActions");
        const response = await getComplaintById(finalId);
        if (!response.success || !response.data)
          throw new AppError("অভিযোগটি পাওয়া যায়নি।");
        const c = response.data!;

        const logoBase64 = await convertToBase64(
          path.join(process.cwd(), "public", "logo.jpg"),
        ).catch(() => undefined);

        const issueDateBn = new Date().toLocaleDateString("bn-BD");
        const receiptNum = c.complaintId.replace(/\D/g, "").slice(0, 5) || "14285";

        const data: HearingNoticeTemplateData = {
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

        html = renderToStaticMarkup(<HearingNoticeTemplate data={data} />);
        break;
      }

      case "completion-notice": {
        const CompletionNoticeTemplate = (
          await import("@/components/features/complaints/CompletionNoticeTemplate")
        ).default;
        const { getComplaintById } = await import("@/actions/complaintActions");
        const response = await getComplaintById(finalId);
        if (!response.success || !response.data)
          throw new AppError("অভিযোগটি পাওয়া যায়নি।");
        const c = response.data!;

        const logoBase64 = await convertToBase64(
          path.join(process.cwd(), "public", "logo.jpg"),
        ).catch(() => undefined);

        const resolvedDateBn = new Date().toLocaleDateString("bn-BD");
        const receiptNo = c.complaintId.replace(/\D/g, "").slice(0, 5) || "14285";

        const data: CompletionNoticeTemplateData = {
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

        html = renderToStaticMarkup(<CompletionNoticeTemplate data={data} />);
        break;
      }

      default:
        throw new AppError("অকার্যকর ডকুমেন্ট টাইপ।");
    }

    const puppeteer = (await import("puppeteer-core")).default;
    const chromium = (await import("@sparticuz/chromium")).default;

    let browser;
    // Chromium setup for Vercel/Production
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      browser = await puppeteer.launch({
        args: (chromium as any).args,
        defaultViewport: (chromium as any).defaultViewport,
        executablePath: await (chromium as any).executablePath(),
        headless: (chromium as any).headless,
      });
    } else {
      // Local development Chrome paths
      const chromePaths = [
        path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
      ];
      let executablePath = null;
      for (const p of chromePaths) {
        if (fs.existsSync(p)) {
          executablePath = p;
          break;
        }
      }
      if (!executablePath) throw new AppError("Chrome browser was not found locally.");
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
    
    // Return Uint8Array as expected by DocDownloadPage
    return { 
       success: true, 
       pdfBuffer: new Uint8Array(pdf),
       docType: finalDocType 
    };
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return { success: false, message: error.message || "পিডিএফ তৈরি করতে সমস্যা হয়েছে।" };
  }
}
