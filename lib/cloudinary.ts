import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadProductImage(
  buffer: Buffer,
  productRef: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "toss-by-toss/products",
          public_id: productRef.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          overwrite: true,
          transformation: [
            { width: 1200, height: 1500, crop: "fill", gravity: "auto" },
            { quality: "auto:best", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export { cloudinary };
