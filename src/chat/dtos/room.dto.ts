import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserDto } from '../../user/dtos/user.dto';
import { MessageDto } from './message.dto';

export class RoomDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
export class RoomResponse extends OmitType(UserDto, [] as const) {
  @ApiProperty({ type: [UserDto] })
  users: UserDto[];

  @ApiProperty({ type: [MessageDto] })
  messages: MessageDto[];
}
