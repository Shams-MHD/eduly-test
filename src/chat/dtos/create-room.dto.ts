import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'name of room' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'id of user who i want to make room with' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
