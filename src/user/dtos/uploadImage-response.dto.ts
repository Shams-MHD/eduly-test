import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty()
  uploadUrl: string;

  @ApiProperty()
  fileName: string;
}
