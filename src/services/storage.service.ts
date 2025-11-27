import * as fs from 'fs/promises';
import * as path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
 * This service supports multiple cloud storage providers:
 * 1. AWS S3 (recommended for temporary use)
 * 2. Hostinger S3-compatible API
 * 3. Hostinger FTP Access
 * 4. Local filesystem (for development/testing)
 *
 * Configure using STORAGE_TYPE environment variable:
 * - 'aws-s3' for AWS S3
 * - 's3' for Hostinger S3-compatible
 * - 'ftp' for Hostinger FTP
 * - 'local' for local filesystem
 *
 * AWS S3 Configuration:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION (default: us-east-1)
 * - AWS_S3_BUCKET_NAME
 *
 * Hostinger Configuration:
 * - HOSTINGER_STORAGE_TYPE (fallback)
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
  private awsAccessKeyId: string;
  private awsSecretAccessKey: string;
  private awsRegion: string;
  private awsBucketName: string;
  private s3Client: S3Client | null = null;

  constructor() {
    this.storageType = process.env.STORAGE_TYPE || process.env.HOSTINGER_STORAGE_TYPE || 'local';
    this.apiKey = process.env.HOSTINGER_API_KEY || '';
    this.apiSecret = process.env.HOSTINGER_API_SECRET || '';
    this.bucketName = process.env.HOSTINGER_BUCKET_NAME || '';
    this.cdnUrl = process.env.HOSTINGER_CDN_URL || '';

    // AWS S3 Configuration
    this.awsAccessKeyId = process.env.AWS_ACCESS_KEY || '';
    this.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    this.awsRegion = process.env.BUCKET_REGION || 'us-east-1';
    this.awsBucketName = process.env.BUCKET_NAME || '';

    // Initialize S3 client if AWS is configured
    if (this.awsAccessKeyId && this.awsSecretAccessKey) {
      this.s3Client = new S3Client({
        region: this.awsRegion,
        credentials: {
          accessKeyId: this.awsAccessKeyId,
          secretAccessKey: this.awsSecretAccessKey,
        },
      });
    }

    this.validateConfig();
  }

  private validateConfig(): void {
    if (this.storageType === 'aws-s3') {
      if (!this.awsAccessKeyId || !this.awsSecretAccessKey || !this.awsBucketName) {
        console.warn(
          '⚠️ AWS S3 credentials not fully configured. Upload may fail.'
        );
        console.warn(
          'Set: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME'
        );
      }
    } else if (this.storageType === 's3') {
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
    if (this.storageType === 'aws-s3') {
      return this.uploadToAWSS3(options);
    } else if (this.storageType === 's3') {
      return this.uploadToS3(options);
    } else if (this.storageType === 'ftp') {
      return this.uploadToFTP(options);
    } else {
      // Local storage for development/testing
      return this.uploadToLocal(options);
    }
  }

  /**
   * Upload to AWS S3
   * Uses official AWS SDK v3
   */
  private async uploadToAWSS3(options: UploadOptions): Promise<UploadResult> {
    try {
      if (!this.s3Client) {
        throw new Error('AWS S3 client not initialized. Check your AWS credentials.');
      }

      // Generate unique filename with extension
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15); // More random chars
      const fileExtension = this.getFileExtension(options.fileName);
      const uniqueFileName = `uploads/${timestamp}-${randomStr}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.awsBucketName,
        Key: uniqueFileName,
        Body: options.fileBuffer,
        ContentType: options.mimeType,
        ACL: 'public-read', // Make file publicly accessible
      });

      await this.s3Client.send(command);

      // Construct public URL
      const url = `https://${this.awsBucketName}.s3.${this.awsRegion}.amazonaws.com/${uniqueFileName}`;

      return {
        url,
        fileName: uniqueFileName, // Return the unique filename
        size: options.fileBuffer.length,
      };
    } catch (error) {
      throw new Error(
        `AWS S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '';
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
        'Hostinger S3 upload not yet configured. Please setup Hostinger S3 configuration'
      );
    } catch (error) {
      throw new Error(
        `Hostinger S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      if (this.storageType === 'aws-s3') {
        if (!this.s3Client) {
          throw new Error('AWS S3 client not initialized.');
        }

        // Extract key from URL or use filename directly
        let key = fileName;
        if (fileName.startsWith('https://')) {
          // Extract key from S3 URL
          const urlParts = fileName.split('/');
          key = urlParts.slice(3).join('/'); // Remove bucket and region parts
        }

        const command = new DeleteObjectCommand({
          Bucket: this.awsBucketName,
          Key: key,
        });

        await this.s3Client.send(command);
      } else if (this.storageType === 's3') {
        // TODO: Implement Hostinger S3 delete
        console.log(`Hostinger S3 delete not implemented for: ${fileName}`);
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
