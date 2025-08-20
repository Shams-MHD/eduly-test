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

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Get()
  async getAllRooms() {
    return this.chatService.getAllRooms();
  }

  @Public()
  @Get(':id')
  async getRoomById(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getRoomById(id);
  }

  @Public()
  @Post()
  async createRoom(@Body() body: { name: string; userIds: number[] }) {
    const { name, userIds } = body;
    return this.chatService.createRoom(name, userIds);
  }

  @Get('rooms/user/:id')
  async getUserRooms(@Param('id', ParseIntPipe) userId: number) {
    return await this.chatService.getUserRooms(userId);
  }

  @Post(':room/messages')
  async addMessageToRoom(
    @Param('room') room: string,
    @Body() body: { userId: number; text: string },
  ) {
    const { userId, text } = body;
    return this.chatService.addMessageToRoom(room, userId, text);
  }
}
