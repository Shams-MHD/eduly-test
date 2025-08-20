import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../common/upload/upload.module';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [JwtModule.register({}), PrismaModule, UploadModule],
  controllers: [UserController],
  providers: [UserService, RefreshTokenStrategy, AccessTokenStrategy],
})
export class UserModule {}
