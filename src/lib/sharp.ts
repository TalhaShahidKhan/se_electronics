import sharp from "sharp";

export async function compressImage(
    fileBuffer: Buffer,
    category: "product" | "warranty" | "nid" | "portrait"
): Promise<Buffer> {
    const image = sharp(fileBuffer).rotate(); // auto-fix orientation from mobile cameras

    switch (category) {
        case "product":
            return image
                .resize({ width: 1600, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

        case "warranty":
        case "nid":
            return image
                .resize({ width: 2400, withoutEnlargement: true })
                .webp({ quality: 88 })
                .toBuffer();

        case "portrait":
            return image
                .resize({ width: 1000, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

        default:
            return image.webp({ quality: 80 }).toBuffer();
    }
}