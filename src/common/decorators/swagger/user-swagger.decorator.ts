import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ProfileDto } from '../../../user/dtos/user.dto';

export function GetUserSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'upload succeeded',
      type: ProfileDto,
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
