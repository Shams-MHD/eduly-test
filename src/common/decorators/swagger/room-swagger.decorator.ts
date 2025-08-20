import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { RoomDto, RoomResponse } from '../../../chat/dtos/room.dto';
import { MessageDto } from '../../../chat/dtos/message.dto';

export function GetRoomsSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'fetch succeeded',
      type: [RoomDto],
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}

export function CreateRoomSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'creation succeeded',
      type: RoomDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}

export function GetRoomSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'fetch succeeded',
      type: RoomResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}

export function GetUserRooms(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'fetch succeeded',
      type: [RoomDto],
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}

export function CreateMsgSwagger(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'creation succeeded',
      type: MessageDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'internal server error',
    }),
  );
}
