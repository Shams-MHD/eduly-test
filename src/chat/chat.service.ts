import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomDto } from './dtos/room.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(name: string, userIds: number[]) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException('Some users not found');
    }

    const newRoom = await this.prisma.room.create({
      data: {
        name,
        users: {
          connect: userIds.map((id) => ({ id })),
        },
      },
      // no include => only room fields are returned
    });

    return newRoom;
  }

  async getAllRooms(): Promise<RoomDto[]> {
    return this.prisma.room.findMany();
  }

  async getRoomById(roomId: number) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { users: true, messages: true },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    return room;
  }

  async getUserRooms(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        rooms: {
          include: {},
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.rooms;
  }

  async addMessageToRoom(roomName: string, userId: number, text: string) {
    const room = await this.prisma.room.findUnique({
      where: { name: roomName },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room.id} not found`);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.message.create({
      data: {
        text,
        room: { connect: { id: room.id } },
        user: { connect: { id: userId } },
      },
    });
  }
}
