import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenResponseDto } from '../../../user/dtos/token-response.dto';

export function SignUpSwagger(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Sign up for new users',
      description: 'For users who want to create an account',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Sign up succeeded',
      type: TokenResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'The entered email is already used',
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'bad request' }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}

export function SignInSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'sign in succeeded',
      type: TokenResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'wrong credentials',
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'bad request' }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}

export function RefreshSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'refresh succeeded',
      type: TokenResponseDto,
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
