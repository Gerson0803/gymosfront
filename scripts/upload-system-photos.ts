import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { stat } from "fs/promises";
import { config } from "dotenv";

config({ path: ".env.local" });

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "gymos-images";
const FOLDER = "fotos-del-sistema";
const PUBLIC_DIR = join(process.cwd(), "public");

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"];

function isImage(filename: string): boolean {
  return IMAGE_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext));
}

async function getExistingKeys(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${FOLDER}/`,
  });
  const response = await s3.send(command);
  return (response.Contents || []).map(obj => obj.Key).filter((key): key is string => key !== undefined);
}

async function uploadFile(filename: string, filepath: string): Promise<void> {
  const key = `${FOLDER}/${filename}`;
  const fileContent = await readFile(filepath);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: getMimeType(filename),
  });

  await s3.send(command);
  console.log(`✅ Uploaded: ${key}`);
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

async function main() {
  console.log("🚀 Starting upload to S3...\n");

  try {
    const files = await readdir(PUBLIC_DIR);
    const imageFiles = files.filter(f => isImage(f));

    if (imageFiles.length === 0) {
      console.log("No images found in public folder");
      return;
    }

    console.log(`Found ${imageFiles.length} image(s):\n`);

    for (const file of imageFiles) {
      const filepath = join(PUBLIC_DIR, file);
      try {
        await stat(filepath);
        await uploadFile(file, filepath);
      } catch (err) {
        const error = err as Error;
        console.error(`❌ Error uploading ${file}:`, error.message);
      }
    }

    console.log("\n✨ Done! All images uploaded to S3.");
  } catch (err) {
    const error = err as Error;
    console.error("Error:", error.message);
  }
}

main();