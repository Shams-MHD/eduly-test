import {
  BlobSASPermissions,
  BlobServiceClient,
  BlockBlobClient,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { uuid } from 'uuidv4';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as fss from 'fs/promises';
import { Response } from 'express';

@Injectable()
export class UploadService {
  private readonly sharedKeyCredential = new StorageSharedKeyCredential(
    this.configService.get('AZURE_STORAGE_ACCOUNT_NAME'),
    this.configService.get('AZURE_STORAGE_ACCOUNT_KEY'),
  );

  constructor(private readonly configService: ConfigService) {}

  private containerName: string = this.configService.get(
    'AZURE_STORAGE_CONTAINER',
  );

  private async getBlobServiceInstance() {
    const connectionString = this.configService.get(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    const blobClientService =
      await BlobServiceClient.fromConnectionString(connectionString);

    return blobClientService;
  }

  private async getBlobClient(imageName: string): Promise<BlockBlobClient> {
    const blobService = await this.getBlobServiceInstance();
    const containerName = this.containerName;
    const containerClient = blobService.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(imageName);
    return blockBlobClient;
  }

  public async uploadFile(file: Express.Multer.File) {
    const extension = file.originalname.split('.').pop();
    const file_name = uuid() + '.' + extension;
    const blockBlobClient = await this.getBlobClient(file_name);

    // new new
    const stream = fs.createReadStream(file.path);
    const bufferSize = 4 * 1024 * 1024; // 4MB
    const maxConcurrency = 20;

    // await fss.unlink(file.path);

    try {
      await blockBlobClient.uploadStream(stream, bufferSize, maxConcurrency, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      // // new
      // const stream = file.stream;
      // const bufferSize = 4 * 1024 * 1024; // 4MB chunks
      // const maxConcurrency = 20;
      //
      // await blockBlobClient.uploadStream(stream, bufferSize, maxConcurrency, {
      //   blobHTTPHeaders: { blobContentType: file.mimetype },
      // });

      // // Upload the file buffer to Azure Blob Storage
      // await blockBlobClient.uploadData(file.buffer);

      // After a successful upload, generate a signed URL for secure access
      const signedUrl = await this.getSignedUrl(file_name);

      return { file_name, signedUrl };
    } finally {
      stream.close?.();
      await fss.unlink(file.path).catch(() => {});
    }
  }

  public async getSignedUrl(
    fileName: string,
    ttlSeconds = 3600,
  ): Promise<string> {
    const expiresOn = new Date(Date.now() + ttlSeconds * 10000); // 10 hour expiration
    const blobClient = await this.getBlobClient(fileName);

    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse('r'), // 'r' for read-only access
        protocol: SASProtocol.Https,
        expiresOn,
      },
      this.sharedKeyCredential,
    ).toString();

    return `${blobClient.url}?${sas}`;
  }

  // public async uploadFile(file: Express.Multer.File) {
  //   this.containerName = this.configService.get('AZURE_STORAGE_CONTAINER');
  //   const extension = file.originalname.split('.').pop();
  //   const file_name = uuid() + '.' + extension;
  //   const blockBlobClient = await this.getBlobClient(file_name);
  //   const fileUrl = blockBlobClient.url;
  //   await blockBlobClient.uploadData(file.buffer);
  //
  //   return fileUrl;
  // }

  // async deleteFile(file_name: string, containerName: string) {
  //   try {
  //     this.containerName = containerName;
  //     const blockBlobClient = await this.getBlobClient(file_name);
  //     await blockBlobClient.deleteIfExists();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  //
  // public async downloadFile(file_name: string, containerName: string) {
  //   this.containerName = containerName;
  //   const blockBlobClient = await this.getBlobClient(file_name);
  //   const downloadBlockBlobResponse = await blockBlobClient.download();
  //   const downloaded = (
  //     await this.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
  //   ).toString();
  //   return downloaded;
  // }
  //
  // private streamToBuffer(readableStream) {
  //   return new Promise((resolve, reject) => {
  //     const chunks = [];
  //     readableStream.on('data', (data) => {
  //       chunks.push(data instanceof Buffer ? data : Buffer.from(data));
  //     });
  //     readableStream.on('end', () => {
  //       resolve(Buffer.concat(chunks));
  //     });
  //     readableStream.on('error', reject);
  //   });
  // }

  public async downloadFile(fileName: string, res: Response) {
    const blockBlobClient = await this.getBlobClient(fileName);
    const downloadResponse = await blockBlobClient.download();

    res.set(
      'content-type',
      downloadResponse.contentType ?? 'application/octet-stream',
    );

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return downloadResponse.readableStreamBody.pipe(res);
  }
}
