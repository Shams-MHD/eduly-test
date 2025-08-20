import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  role: string;
}

export class ProfileDto extends OmitType(UserDto, [
  'role',
  'password',
] as const) {}
