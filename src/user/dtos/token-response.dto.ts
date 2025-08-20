import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access Token for your API',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    example: 'ewo8somesuperlongrefreshtokenstring...',
    description: 'JWT Refresh Token for your API',
  })
  @IsString()
  refreshToken: string;
}
