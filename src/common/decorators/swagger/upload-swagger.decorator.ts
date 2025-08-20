import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UploadImageResponseDto } from '../../../user/dtos/uploadImage-response.dto';

export function UploadSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'upload succeeded',
      type: UploadImageResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'refresh token is missing',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}
