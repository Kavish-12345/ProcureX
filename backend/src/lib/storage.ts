import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/index.js';

// Supabase Storage speaks the S3 API, so the AWS SDK works against it unchanged.
// Two things differ from real S3:
//   - forcePathStyle: Supabase serves buckets as <endpoint>/<bucket>/<key>, not
//     the virtual-hosted <bucket>.<endpoint> form the SDK defaults to.
//   - the endpoint and region come from the project dashboard rather than being
//     derived from an account id.
// Nothing outside this file knows which provider is behind it — swapping to R2,
// S3, or anything else S3-compatible is a change to these values only.
const storage = new S3Client({
  region: config.storageRegion,
  endpoint: config.storageEndpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.storageAccessKeyId,
    secretAccessKey: config.storageSecretAccessKey,
  },
});

export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await storage.send(
    new PutObjectCommand({
      Bucket: config.storageBucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${config.storagePublicUrl}/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  await storage.send(
    new DeleteObjectCommand({
      Bucket: config.storageBucket,
      Key: key,
    })
  );
}

// The DB stores the full public URL, but deletes need the object key — this
// recovers one from the other so callers don't have to store both.
export function extractKeyFromUrl(url: string): string | null {
  const prefix = `${config.storagePublicUrl}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}
