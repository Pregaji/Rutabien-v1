import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2, EU jurisdiction — S3-compatible API. R2 encrypts all
// objects at rest by default (see CLAUDE.md "Documents encrypted at rest").
let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 storage credentials are missing");
  }
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _client;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET is missing");
  return bucket;
}

const PRESIGN_TTL_SECONDS = 5 * 60;

export function documentObjectKey(userId: string, documentId: string) {
  return `documents/${userId}/${documentId}`;
}

export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), command, { expiresIn: PRESIGN_TTL_SECONDS });
}

// Caller must have already passed step-up verification for this session
// (see lib/stepUp.ts) before this is issued — enforced at the route level,
// not here, since this module has no notion of sessions.
export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  return getSignedUrl(getClient(), command, { expiresIn: PRESIGN_TTL_SECONDS });
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}
