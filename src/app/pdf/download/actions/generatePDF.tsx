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