import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from '../common/decorators/public.decorator';
import { RoomDto } from './dtos/room.dto';
import {
  CreateMsgSwagger,
  CreateRoomSwagger,
  GetRoomsSwagger,
  GetRoomSwagger,
  GetUserRooms,
} from '../common/decorators/swagger/room-swagger.decorator';
import { GetCurrentUserId } from '../common/decorators/get-user-id.decorator';
import { CreateRoomDto } from './dtos/create-room.dto';
import { CreateMessageDto } from './dtos/create-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @GetRoomsSwagger()
  @Public()
  @Get()
  async getAllRooms(): Promise<RoomDto[]> {
    return await this.chatService.getAllRooms();
  }

  @GetRoomSwagger()
  @Public()
  @Get(':id')
  async getRoomById(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getRoomById(id);
  }

  @CreateRoomSwagger()
  @Post()
  async createRoom(
    @Body() body: CreateRoomDto,
    @GetCurrentUserId() id: number,
  ) {
    const { name, userId } = body;
    return this.chatService.createRoom(name, [userId, id]);
  }

  @GetUserRooms()
  @Get('rooms/user/:id')
  async getUserRooms(@Param('id', ParseIntPipe) userId: number) {
    return await this.chatService.getUserRooms(userId);
  }

  @CreateMsgSwagger()
  @Public()
  @Post('/create/message')
  async addMessageToRoom(@Body() body: CreateMessageDto) {
    return this.chatService.addMessageToRoom(body.room, body.userId, body.text);
  }
}
