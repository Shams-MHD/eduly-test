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

    const stream = fs.createReadStream(file.path);
    const bufferSize = 4 * 1024 * 1024; // 4MB
    const maxConcurrency = 20;

    try {
      await blockBlobClient.uploadStream(stream, bufferSize, maxConcurrency, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

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
