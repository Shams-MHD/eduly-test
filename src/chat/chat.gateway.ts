import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('ChatGateway');
  afterInit(server: any): any {
    this.logger.log('initialized ......');
  }

  handleConnection(client: any, ...args): any {
    this.logger.log(`client connected : ${client.id}`);
  }
  handleDisconnect(client: any): any {
    this.logger.log(`client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chatToPublic')
  async handlePublicMessage(
    client: Socket,
    message: { sender: string; message: string },
  ) {
    await this.chatService.addMessageToRoom(
      'public',
      Number(message.sender),
      message.message,
    );
    this.wss.emit('chatToPublic', message);
  }

  @SubscribeMessage('chatToServer')
  async handleMessage(
    client: Socket,
    message: { sender: string; room: string; message: string },
  ) {
    await this.chatService.addMessageToRoom(
      message.room,
      Number(message.sender),
      message.message,
    );
    this.wss.to(message.room).emit('chatToClient', message);
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, room: string) {
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(room);
    client.emit('leftRoom', room);
  }
}
