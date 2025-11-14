import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Cloud Storage Service for Hostinger
 * 
 * This service handles file uploads to Hostinger cloud storage
 * and returns the public URL for database storage
 */

export interface UploadOptions {
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
}

/**
 * Implementation Note:
 * 
 * Hostinger provides several options for cloud storage:
 * 1. S3-compatible API (recommended)
 * 2. FTP Access
 * 3. File Manager API
 * 
 * For now, we provide a template that you can configure with:
 * - HOSTINGER_STORAGE_TYPE (s3, ftp, or local-for-testing)
 * - HOSTINGER_API_KEY
 * - HOSTINGER_API_SECRET
 * - HOSTINGER_BUCKET_NAME
 * - HOSTINGER_CDN_URL
 */

class CloudStorageService {
  private storageType: string;
  private apiKey: string;
  private apiSecret: string;
  private bucketName: string;
  private cdnUrl: string;

  constructor() {
    this.storageType = process.env.HOSTINGER_STORAGE_TYPE || 'local';
    this.apiKey = process.env.HOSTINGER_API_KEY || '';
    this.apiSecret = process.env.HOSTINGER_API_SECRET || '';
    this.bucketName = process.env.HOSTINGER_BUCKET_NAME || '';
    this.cdnUrl = process.env.HOSTINGER_CDN_URL || '';

    this.validateConfig();
  }

  private validateConfig(): void {
    if (this.storageType === 's3') {
      if (!this.apiKey || !this.apiSecret || !this.bucketName) {
        console.warn(
          '⚠️ Hostinger S3 credentials not fully configured. Upload may fail.'
        );
        console.warn(
          'Set: HOSTINGER_API_KEY, HOSTINGER_API_SECRET, HOSTINGER_BUCKET_NAME'
        );
      }
    }
  }

  /**
   * Upload file to cloud storage
   * Returns URL that will be stored in database
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    if (this.storageType === 's3') {
      return this.uploadToS3(options);
    } else if (this.storageType === 'ftp') {
      return this.uploadToFTP(options);
    } else {
      // Local storage for development/testing
      return this.uploadToLocal(options);
    }
  }

  /**
   * Upload to Hostinger S3-compatible storage
   * This is the recommended approach for Hostinger
   */
  private async uploadToS3(options: UploadOptions): Promise<UploadResult> {
    try {
      // TODO: Implement AWS SDK S3 upload
      // Hostinger provides S3-compatible endpoints
      // You'll need to install: npm install aws-sdk

      /*
      Example implementation:
      
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3({
        accessKeyId: this.apiKey,
        secretAccessKey: this.apiSecret,
        endpoint: 'hostinger-s3-endpoint.com', // Get from Hostinger
        s3ForcePathStyle: true,
        region: 'auto'
      });

      const params = {
        Bucket: this.bucketName,
        Key: `uploads/${Date.now()}-${options.fileName}`,
        Body: options.fileBuffer,
        ContentType: options.mimeType,
        ACL: 'public-read'
      };

      const result = await s3.upload(params).promise();
      
      const url = this.cdnUrl 
        ? `${this.cdnUrl}/${params.Key}`
        : result.Location;

      return {
        url,
        fileName: options.fileName,
        size: options.fileBuffer.length
      };
      */

      throw new Error(
        'S3 upload not yet configured. Please setup AWS SDK configuration'
      );
    } catch (error) {
      throw new Error(
        `S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload to Hostinger via FTP
   * Alternative if S3 is not available
   */
  private async uploadToFTP(options: UploadOptions): Promise<UploadResult> {
    try {
      // TODO: Implement FTP upload using ftp package
      // You'll need to install: npm install ftp

      /*
      Example implementation:
      
      const Client = require('ftp');
      const client = new Client();

      await new Promise((resolve, reject) => {
        client.on('ready', () => {
          const fileName = `uploads/${Date.now()}-${options.fileName}`;
          client.put(options.fileBuffer, fileName, (err) => {
            if (err) reject(err);
            client.end();
            resolve(undefined);
          });
        });

        client.on('error', reject);

        client.connect({
          host: process.env.HOSTINGER_FTP_HOST,
          user: process.env.HOSTINGER_FTP_USER,
          password: process.env.HOSTINGER_FTP_PASSWORD
        });
      });

      const publicUrl = `https://yourdomain.com/uploads/${options.fileName}`;
      return {
        url: publicUrl,
        fileName: options.fileName,
        size: options.fileBuffer.length
      };
      */

      throw new Error(
        'FTP upload not yet configured. Please setup FTP credentials'
      );
    } catch (error) {
      throw new Error(
        `FTP upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload to local filesystem (for development/testing only)
   * NOT recommended for production
   */
  private async uploadToLocal(options: UploadOptions): Promise<UploadResult> {
    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomStr}-${options.fileName}`;
      const filePath = path.join(uploadDir, fileName);

      // Write file to disk
      await fs.writeFile(filePath, options.fileBuffer);

      // Return public URL
      const publicUrl = `/uploads/${fileName}`;

      return {
        url: publicUrl,
        fileName: fileName,
        size: options.fileBuffer.length,
      };
    } catch (error) {
      throw new Error(
        `Local upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete file from cloud storage
   * Useful for cleanup or when posting is deleted
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      if (this.storageType === 's3') {
        // TODO: Implement S3 delete
        console.log(`S3 delete not implemented for: ${fileName}`);
      } else if (this.storageType === 'ftp') {
        // TODO: Implement FTP delete
        console.log(`FTP delete not implemented for: ${fileName}`);
      } else {
        // Local delete
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, fileName);
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error(
        `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      // Don't throw - deletion failures shouldn't crash the app
    }
  }
}

// Export singleton instance
export const cloudStorageService = new CloudStorageService();
