import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File): Promise<string> {
  const key = `avatars/${Date.now()}-${file.name}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: key,
    ContentType: file.type,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: key,
  });
  await s3.send(command);
}