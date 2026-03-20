import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { createCanvas } from "canvas";

export async function qrcode(text: string): Promise<string> {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        console.error("QR Code Error:", err);
        return "";
    }
}

export async function barcode(text: string): Promise<string> {
    try {
        const canvas = createCanvas(150, 40);
        JsBarcode(canvas, text, {
            format: "CODE128",
            displayValue: false,
            width: 2,
            height: 30,
            margin: 0,
        });
        return canvas.toDataURL();
    } catch (err) {
        console.error("Barcode Error:", err);
        return "";
    }
}
