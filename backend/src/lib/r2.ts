import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/index.js';

// R2 speaks the S3 API, so the standard AWS SDK works against it — it just needs
// R2's endpoint and its fixed 'auto' region instead of a real AWS region.
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey,
  },
});

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: config.r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${config.r2PublicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: config.r2BucketName,
      Key: key,
    })
  );
}

// The DB stores the full public URL, but deletes need the object key — this
// recovers one from the other so callers don't have to store both.
export function extractKeyFromUrl(url: string): string | null {
  const prefix = `${config.r2PublicUrl}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}
