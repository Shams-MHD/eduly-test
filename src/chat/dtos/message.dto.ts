import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  roomId: number;
}
