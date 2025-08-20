import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ImageFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // ✅ 1. Check MIME type (accept only images)
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Invalid file type, only images are allowed',
      );
    }

    // ✅ 2. Check extension
    const ext = file.originalname.split('.').pop().toLowerCase();
    const allowedExt = ['jpg', 'jpeg', 'png', 'gif'];
    if (!allowedExt.includes(ext)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed: ${allowedExt.join(', ')}`,
      );
    }

    // ✅ 3. Check file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File too large (max 5MB)');
    }

    return file;
  }
}
