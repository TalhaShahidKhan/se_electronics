'use server'

import { deleteAuthToken, getInvoiceByNumber, getPaymentByNumber, getStaffById, verifyAuthToken } from "@/actions";
import { verifySession } from "@/lib";
import { CertificateData, DocType } from "@/types";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import fs from "node:fs/promises"
import path from "node:path"
import { existsSync } from "node:fs"
import { AppError } from "@/utils";

/** Get system Chrome path for Windows (used when @sparticuz/chromium is Linux-only) */
function getChromePathForWindows(): string | null {
    const paths = [
        path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of paths) {
        if (p && existsSync(p)) return p;
    }
    return null;
}

type ReturnType = Promise<{
    success: true,
    pdfBuffer: Uint8Array,
    docType: DocType
} | {
    success: false,
    message: string
}>

export const convertToBase64 = async (path: string) => {
    const buffer = await fs.readFile(path);
    const base64String = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    return base64String;
}

export default async function generatePDF(args: { docType: DocType, id: string, token: string }): ReturnType {
    try {
        let docType: DocType
        let id: string
        let issuedAt: Date = new Date();
        let certificateData: CertificateData
        let html: string
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        if (args.token) {
            const tokenData = await verifyAuthToken(args.token)
            if (!tokenData.isValid) {
                throw new AppError("টোকেনটি সঠিক নয় বা মেয়াদ উত্তীর্ণ হয়ে গেছে।")
            }

            docType = tokenData.payload.type
            id = tokenData.payload.id

            if (tokenData.payload.issuedAt) {
                issuedAt = tokenData.payload.issuedAt
            }

            if (docType === 'certificate') {
                certificateData = tokenData.payload
            }

        } else {
            const session = await verifySession(false)
            if (!session) {
                throw new AppError("এই ফাইলটি ডাউনলোড করার জন্য আপনার প্রয়োজনীয় অনুমতি নেই।")
            }

            docType = args.docType
            id = args.id
        }

        const { renderToStaticMarkup } = await import('react-dom/server');

        switch (docType) {
            case 'invoice': {
                const InvoiceTemplate = (await import("@/components/features/invoices/InvoiceTemplate")).default;

                const response = await getInvoiceByNumber(id)
                if (!response.success || !response.data) {
                    throw new AppError("ইনভয়েস নম্বরটি সঠিক নয়।")
                }

                const bgImageBase64 = await convertToBase64(path.join(process.cwd(), 'src', 'assets', 'images', response.data!.dueAmount > 0 ? 'customer-invoice-due.jpg' : 'customer-invoice-paid.jpg'));
                const data = {
                    ...response.data,
                    bgImage: bgImageBase64
                }

                html = renderToStaticMarkup(<InvoiceTemplate data={data} />)
                break;
            };
            case 'payment': {
                const PaymentReceiptTemplate = (await import("@/components/features/payments/PaymentReceiptTemplate")).default;

                const response = await getPaymentByNumber(id)
                if (!response.success || !response.data) {
                    throw new AppError("পেমেন্ট নম্বরটি সঠিক নয়।")
                }

                const bgImageBase64 = await convertToBase64(path.join(process.cwd(), 'src', 'assets', 'images', 'payment-receipt.jpg'));
                const data = {
                    ...response.data,
                    bgImage: bgImageBase64
                }

                html = renderToStaticMarkup(<PaymentReceiptTemplate data={data} />)
                break;
            };
            case 'id-card': {
                const IdCardTemplate = (await import("@/components/features/staff/IdCardTemplate")).default;

                const response = await getStaffById(id)
                if (!response.success || !response.data) {
                    throw new AppError("স্টাফ আইডিটি সঠিক নয়।")
                }

                const canvas = createCanvas(200, 45)
                JsBarcode(canvas, response.data!.staffId, {
                    format: 'CODE128',
                    width: 3,
                    height: 45,
                    displayValue: false,
                    margin: 0,
                    background: 'transparent'
                });

                const frontBgImageBase64 = await convertToBase64(path.join(process.cwd(), 'src', 'assets', 'images', response.data!.role === 'electrician' ? 'electrician-card.jpg' : 'technician-card.jpg'));
                const backBgImageBase64 = await convertToBase64(path.join(process.cwd(), 'src', 'assets', 'images', 'id-card-back.jpg'));
                const qrcodeBase64 = await QRCode.toDataURL(baseUrl + '/team-members', { width: 80, margin: 2, color: { light: '#00000000' } })
                const barcodeBase64 = canvas.toDataURL('image/png');

                const staff = response.data!;
                const data = {
                    ...staff,
                    currentPoliceStation: staff.currentPoliceStation ?? '',
                    currentPostOffice: staff.currentPostOffice ?? '',
                    frontBgImage: frontBgImageBase64,
                    backBgImage: backBgImageBase64,
                    qrcode: qrcodeBase64,
                    barcode: barcodeBase64,
                    issueDate: issuedAt
                }

                html = renderToStaticMarkup(<IdCardTemplate data={data} />)
                break;
            };
            case 'certificate': {
                const CertificateTemplate = (await import("@/components/features/staff/CertificateTemplate")).default;

                const staffProfileUrl = baseUrl + '/team-members?staffId=' + certificateData!.staffId

                const [qrCodeBase64, bgImageBase64, font1Base64, font2Base64, font3Base64] = await Promise.all([
                    QRCode.toDataURL(staffProfileUrl, { width: 100, margin: 2, color: { light: '#00000000' } }),
                    convertToBase64(path.join(process.cwd(), 'src', 'assets', 'images', 'certificate-template.jpg')),
                    convertToBase64(path.join(process.cwd(), 'src', 'assets', 'fonts', 'oldenglishtextmt.ttf')),
                    convertToBase64(path.join(process.cwd(), 'src', 'assets', 'fonts', 'edwardianscriptitc.ttf')),
                    convertToBase64(path.join(process.cwd(), 'src', 'assets', 'fonts', 'brockScript.ttf'))
                ])

                const data = {
                    ...certificateData!,
                    bgImage: bgImageBase64,
                    qrcode: qrCodeBase64,
                    font1: font1Base64,
                    font2: font2Base64,
                    font3: font3Base64,
                    issueDate: issuedAt
                }

                html = renderToStaticMarkup(<CertificateTemplate data={data} />)
                break;
            };
            case 'complaint': {
                const ComplaintTemplate = (await import("@/components/features/complaints/ComplaintTemplate")).default;
                const { getComplaintById } = await import("@/actions/complaintActions");

                const response = await getComplaintById(id)
                if (!response.success || !response.data) {
                    throw new AppError("অভিযোগ আইডিটি সঠিক নয়।")
                }

                const bgImageBase64 = await convertToBase64(path.join(process.cwd(), 'src', 'assets', 'images', 'payment-receipt.jpg'));
                const complaint = response.data!;
                const data = {
                    ...complaint,
                    bgImage: bgImageBase64
                }

                html = renderToStaticMarkup(<ComplaintTemplate data={data as any} />)
                break;
            };

            case 'hearing-notice': {
                const { getComplaintById } = await import("@/actions/complaintActions");
                const response = await getComplaintById(id);
                if (!response.success || !response.data) throw new AppError("অভিযোগটি পাওয়া যায়নি।");
                const c = response.data!;
                const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                const issueDateBn = new Date().toLocaleDateString('bn-BD');
                const receiptNum = c.complaintId.replace(/\D/g, '').slice(0, 5) || '14285';
                html = `
                <div style="font-family: 'SolaimanLipi', serif; padding: 72px 80px; max-width: 820px; margin: 0 auto; background: #fff; line-height: 1.9; font-size: 15px; color: #111;">

                  <div style="margin-bottom: 32px;">
                    <p>বরাবর,</p>
                    <p style="font-weight: 700;">${c.customer?.name}</p>
                    <p>আইডিঃ ${c.customer?.customerId}</p>
                    <p>${c.customer?.address}</p>
                    <p>মোবাইলঃ ${c.customer?.phone}</p>
                  </div>

                  <div style="margin-bottom: 28px;">
                    <p><strong>বিষয়ঃ- শুনানির নোটিশ (Hearing Notice)।</strong></p>
                  </div>

                  <div style="margin-bottom: 24px;">
                    <p>জনাব / জনাবা,</p>
                    <p style="text-align: justify; margin-top: 8px;">
                      আপনার দায়েরকৃত অভিযোগ ট্র্যাকিং নম্বর <strong style="font-family: monospace;">${c.complaintId}</strong> সম্পর্কিত বিষয়ে অর্থাৎ <strong>"${c.subject}"</strong> — এই বিষয়ের উপর ভিত্তি করে এস ই ইলেকট্রনিক্স সার্ভিস কোয়ালিটি প্রটেকশন বিভাগ একটি আনুষ্ঠানিক শুনানি আহ্বান করেছে।
                    </p>
                  </div>

                  <div style="margin-bottom: 24px;">
                    <p style="font-weight: 700; text-decoration: underline; margin-bottom: 8px;">অভিযোগকারীর কাস্টমার বিবরণঃ</p>
                    <p><strong>নামঃ</strong> ${c.customer?.name}</p>
                    <p><strong>কাস্টমার আইডিঃ</strong> ${c.customer?.customerId}</p>
                    <p><strong>মোবাইল নম্বরঃ</strong> ${c.customer?.phone}</p>
                    <p><strong>ঠিকানাঃ</strong> ${c.customer?.address}</p>
                  </div>

                  <div style="margin-bottom: 24px;">
                    <p style="font-weight: 700; text-decoration: underline; margin-bottom: 8px;">অভিযুক্ত টেকনিশিয়ানের বিবরণঃ</p>
                    <p><strong>টেকনিশিয়ান নামঃ</strong> ${c.staff?.name}</p>
                    <p><strong>টেকনিশিয়ান আইডিঃ</strong> ${c.staffId}</p>
                    <p><strong>ভূমিকাঃ</strong> ${c.staff?.role?.toUpperCase()}</p>
                    <p><strong>ফোন নম্বরঃ</strong> ${c.staff?.phone}</p>
                  </div>

                  <div style="margin-bottom: 28px;">
                    <p style="font-weight: 700; margin-bottom: 8px;">শুনানির বিস্তারিত নোটিশঃ</p>
                    <p style="text-align: justify; background: #fffbeb; border-left: 4px solid #d97706; padding: 14px 18px; line-height: 1.9;">
                      ${c.adminNote || 'শুনানির তারিখ, সময় ও স্থান পরবর্তীতে জানানো হবে।'}
                    </p>
                  </div>

                  <div style="margin-bottom: 28px;">
                    <p style="font-weight: 700;">অতএব</p>
                    <p style="text-align: justify;">
                      আপনাকে অনুরোধ করা হচ্ছে যে উক্ত শুনানিতে নির্ধারিত সময়ে উপস্থিত থাকুন এবং আপনার দখলে থাকা সকল সাক্ষ্য-প্রমাণ (স্ক্রিনশট, ভিডিও, কল রেকর্ড ইত্যাদি) সাথে নিয়ে আসুন। উপস্থিত না হলে একপক্ষীয় সিদ্ধান্ত নেওয়া হতে পারে।
                    </p>
                  </div>

                  <div style="display: flex; justify-content: flex-end; margin-top: 48px; margin-bottom: 64px;">
                    <div style="text-align: center;">
                      <p style="font-weight: 700; margin-bottom: 24px;">বিনীত নিবেদন</p>
                      <div style="border-bottom: 1px solid #555; width: 130px; margin: 0 auto 6px;"></div>
                      <p>এস ই ইলেকট্রনিক্স</p>
                      <p>সার্ভিস কোয়ালিটি বিভাগ</p>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ccc; padding-top: 16px; margin-top: 24px;">
                    <div>
                      <div style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid #1a3c8f; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        <span style="font-size: 8px; font-weight: 900; color: #1a3c8f; text-align:center; letter-spacing:1px;">SE<br>ELEC</span>
                      </div>
                      <p><strong>তারিখঃ</strong> ${issueDateBn}</p>
                      <p><strong>শুনানি নোটিশ ট্র্যাকিং নাম্বার</strong> ${c.complaintId}</p>
                      <p><strong>অভিযোগ গ্রহন নাম্বার</strong> SE ${receiptNum}</p>
                    </div>
                    <div style="display: flex; gap: 48px; text-align: center; font-size: 11px;">
                      <div>
                        <div style="border-bottom: 1px solid #333; width: 96px; height: 28px; margin: 0 auto 4px; display: flex; align-items: flex-end; justify-content: center;"><span style="font-size: 16px; font-style: italic;">স্বাক্ষর</span></div>
                        <p style="font-weight: 700;">মোঃ আতিকুর রহমান</p>
                        <p>দায়িত্বপ্রাপ্ত কর্মকর্তা প্রশাসনিক</p>
                        <p>এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
                      </div>
                      <div>
                        <div style="border-bottom: 1px solid #333; width: 96px; height: 28px; margin: 0 auto 4px; display: flex; align-items: flex-end; justify-content: center;"><span style="font-size: 14px; font-style: italic;">স্বাক্ষর</span></div>
                        <p style="font-weight: 700;">মোহাম্মদ আজিম খাঁ</p>
                        <p>সত্যতা যাচাইকারী কর্মকর্তা</p>
                        <p>এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
                      </div>
                    </div>
                  </div>

                </div>`;
                break;
            };

            case 'completion-notice': {
                const { getComplaintById } = await import("@/actions/complaintActions");
                const response = await getComplaintById(id);
                if (!response.success || !response.data) throw new AppError("অভিযোগটি পাওয়া যায়নি।");
                const c = response.data!;
                const resolvedDateBn = new Date().toLocaleDateString('bn-BD');
                const receiptNo = c.complaintId.replace(/\D/g, '').slice(0, 5) || '14285';
                html = `
                <div style="font-family: 'SolaimanLipi', serif; padding: 72px 80px; max-width: 820px; margin: 0 auto; background: #fff; line-height: 1.9; font-size: 15px; color: #111;">

                  <div style="margin-bottom: 32px;">
                    <p>বরাবর,</p>
                    <p style="font-weight: 700;">${c.customer?.name}</p>
                    <p>আইডিঃ ${c.customer?.customerId}</p>
                    <p>${c.customer?.address}</p>
                    <p>মোবাইলঃ ${c.customer?.phone}</p>
                  </div>

                  <div style="margin-bottom: 28px;">
                    <p><strong>বিষয়ঃ- অভিযোগ নিষ্পত্তি পত্র (Complaint Resolution Letter)।</strong></p>
                  </div>

                  <div style="margin-bottom: 24px;">
                    <p>জনাব / জনাবা,</p>
                    <p style="text-align: justify; margin-top: 8px;">
                      আপনার দায়েরকৃত অভিযোগ ট্র্যাকিং নম্বর <strong style="font-family: monospace;">${c.complaintId}</strong> সম্পর্কিত বিষয়ে অর্থাৎ <strong>"${c.subject}"</strong> — এই বিষয়ে এস ই ইলেকট্রনিক্স সার্ভিস কোয়ালিটি প্রটেকশন বিভাগ তদন্ত সম্পন্ন করে চূড়ান্ত সিদ্ধান্ত গ্রহণ করেছে।
                    </p>
                  </div>

                  <div style="margin-bottom: 24px;">
                    <p style="font-weight: 700; text-decoration: underline; margin-bottom: 8px;">অভিযোগকারীর কাস্টমার বিবরণঃ</p>
                    <p><strong>নামঃ</strong> ${c.customer?.name}</p>
                    <p><strong>কাস্টমার আইডিঃ</strong> ${c.customer?.customerId}</p>
                    <p><strong>মোবাইল নম্বরঃ</strong> ${c.customer?.phone}</p>
                    <p><strong>ঠিকানাঃ</strong> ${c.customer?.address}</p>
                  </div>

                  <div style="margin-bottom: 24px;">
                    <p style="font-weight: 700; text-decoration: underline; margin-bottom: 8px;">অভিযুক্ত টেকনিশিয়ানের বিবরণঃ</p>
                    <p><strong>টেকনিশিয়ান নামঃ</strong> ${c.staff?.name}</p>
                    <p><strong>টেকনিশিয়ান আইডিঃ</strong> ${c.staffId}</p>
                    <p><strong>ভূমিকাঃ</strong> ${c.staff?.role?.toUpperCase()}</p>
                    <p><strong>ফোন নম্বরঃ</strong> ${c.staff?.phone}</p>
                  </div>

                  <div style="margin-bottom: 28px;">
                    <p style="font-weight: 700; margin-bottom: 8px;">চূড়ান্ত সিদ্ধান্ত ও বিবরণঃ</p>
                    <p style="text-align: justify; background: #ecfdf5; border-left: 4px solid #059669; padding: 14px 18px; line-height: 1.9;">
                      ${c.adminNote || 'অভিযোগটি যথাযথভাবে পর্যালোচনা করে নিষ্পত্তি করা হয়েছে।'}
                    </p>
                  </div>

                  <div style="margin-bottom: 28px;">
                    <p style="font-weight: 700;">অতএব</p>
                    <p style="text-align: justify;">
                      এই পত্রের মাধ্যমে নিশ্চিত করা হচ্ছে যে উপরোক্ত অভিযোগটি এস ই ইলেকট্রনিক্স সার্ভিস কোয়ালিটি প্রটেকশন বিভাগ কর্তৃক যথাযথভাবে পর্যালোচনা ও নিষ্পত্তি সম্পন্ন হয়েছে। মামলাটি এখন বন্ধ করা হলো। নতুন অভিযোগ দায়ের না হওয়া পর্যন্ত আর কোনো পদক্ষেপের প্রয়োজন নেই। আপনার ধৈর্য ও সহযোগিতার জন্য আন্তরিক ধন্যবাদ।
                    </p>
                  </div>

                  <div style="display: flex; justify-content: flex-end; margin-top: 48px; margin-bottom: 64px;">
                    <div style="text-align: center;">
                      <p style="font-weight: 700; margin-bottom: 24px;">বিনীত নিবেদন</p>
                      <div style="border-bottom: 1px solid #555; width: 130px; margin: 0 auto 6px;"></div>
                      <p>এস ই ইলেকট্রনিক্স</p>
                      <p>সার্ভিস কোয়ালিটি বিভাগ</p>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ccc; padding-top: 16px; margin-top: 24px;">
                    <div>
                      <div style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid #1a3c8f; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        <span style="font-size: 8px; font-weight: 900; color: #1a3c8f; text-align:center; letter-spacing:1px;">SE<br>ELEC</span>
                      </div>
                      <p><strong>তারিখঃ</strong> ${resolvedDateBn}</p>
                      <p><strong>নিষ্পত্তি পত্র ট্র্যাকিং নাম্বার</strong> ${c.complaintId}</p>
                      <p><strong>অভিযোগ গ্রহন নাম্বার</strong> SE ${receiptNo}</p>
                    </div>
                    <div style="display: flex; gap: 48px; text-align: center; font-size: 11px;">
                      <div>
                        <div style="border-bottom: 1px solid #333; width: 96px; height: 28px; margin: 0 auto 4px; display: flex; align-items: flex-end; justify-content: center;"><span style="font-size: 16px; font-style: italic;">স্বাক্ষর</span></div>
                        <p style="font-weight: 700;">মোঃ আতিকুর রহমান</p>
                        <p>দায়িত্বপ্রাপ্ত কর্মকর্তা প্রশাসনিক</p>
                        <p>এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
                      </div>
                      <div>
                        <div style="border-bottom: 1px solid #333; width: 96px; height: 28px; margin: 0 auto 4px; display: flex; align-items: flex-end; justify-content: center;"><span style="font-size: 14px; font-style: italic;">স্বাক্ষর</span></div>
                        <p style="font-weight: 700;">মোহাম্মদ আজিম খাঁ</p>
                        <p>সত্যতা যাচাইকারী কর্মকর্তা</p>
                        <p>এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
                      </div>
                    </div>
                  </div>

                </div>`;
                break;
            };

            default: {
                throw new AppError("Invalid File Type")
            };
        }

        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.maateen.me/solaiman-lipi/font.css" rel="stylesheet">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>${html}</body>
            </html>
        `;

        let browser;

        if (process.env.NODE_ENV === "production") {
            // Production: use @sparticuz/chromium (Linux - Vercel/Lambda)
            const Chromium = (await import("@sparticuz/chromium")).default;
            const puppeteer = await import("puppeteer-core");
            browser = await puppeteer.launch({
                args: Chromium.args,
                executablePath: await Chromium.executablePath(),
                headless: true,
            });
        } else if (process.platform === "win32") {
            // Development on Windows: use system Chrome
            const chromePath = getChromePathForWindows();
            if (!chromePath) {
                throw new Error(
                    "Chrome not found. Install Google Chrome or run: npx puppeteer browsers install chrome"
                );
            }
            const puppeteer = await import("puppeteer-core");
            browser = await puppeteer.launch({
                executablePath: chromePath,
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        } else {
            // Development on Mac/Linux: use full puppeteer (downloads Chromium)
            const puppeteer = await import("puppeteer");
            browser = await puppeteer.launch({ headless: true });
        }

        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: ["domcontentloaded", "networkidle0"] });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: docType === 'certificate',
            printBackground: true,
            preferCSSPageSize: true
        });

        await browser.close();

        if (args.token && pdfBuffer) {
            await deleteAuthToken(args.token)
        }

        return { success: true, pdfBuffer, docType }
    } catch (error: any) {
        return { success: false, message: error.message || 'Something went wrong' }
    }
}