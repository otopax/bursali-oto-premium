/**
 * Cloudflare R2 REST API Adapter
 * S3 uyumlu R2 depolama için AWS SDK veya yerleşik fetch wrapper.
 * AWS SDK kullanılmadığında doğrudan presigned URL üretimi veya
 * Cloudflare Worker API'leri kullanılabilir.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'bursali-oto-media';

// Lazy init S3 Client to avoid errors during build if env vars are missing
let s3Client = null;
function getS3Client() {
  if (!s3Client && ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
      }
    });
  }
  return s3Client;
}

export const CloudflareR2 = {
  /**
   * Sunucu üzerinden R2'ya dosya yükleme (Direct Put)
   * folder: 'vehicle-images' | 'damage-images' | 'invoice-pdf' | 'reports' | 'ocr' | 'avatars' | 'temp'
   */
  async uploadFile(fileBuffer, fileName, contentType, folder = 'temp') {
    const s3 = getS3Client();
    if (!s3) return null;
    
    const key = `${folder}/${fileName}`;
    console.log(`[R2] Uploading ${key} to bucket ${R2_BUCKET}`);
    
    const command = new PutObjectCommand({ 
      Bucket: R2_BUCKET, 
      Key: key, 
      Body: fileBuffer, 
      ContentType: contentType 
    });
    
    await s3.send(command);
    return `https://media.bursaliotoservis.com/${key}`;
  },

  /**
   * İstemciye doğrudan upload yetkisi vermek için Presigned URL üretme.
   */
  async generatePresignedUrl(fileName, folder = 'temp', contentType = 'application/octet-stream') {
    const s3 = getS3Client();
    if (!s3) return null;

    const key = `${folder}/${fileName}`;
    const command = new PutObjectCommand({ 
      Bucket: R2_BUCKET, 
      Key: key,
      ContentType: contentType
    });

    // 1 saat (3600 sn) geçerli URL üretir
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return {
      uploadUrl: signedUrl,
      publicUrl: `https://media.bursaliotoservis.com/${key}`
    };
  }
};
